from io import BytesIO

from .models import (VideoGame, Company, Franchise,
                     GameCompany, GameRelease, GameLanguage, AgeRating,
                     MediaContent)
from .serializers import VideoGameSerializer, DashboardSerializer, VideoGameDetailsSerializer, GuessTheGameSerializer
from .enums import PopularityType, MediaType, ArtworkType, GameType
import CDnutz_core.utils as utils

from rest_framework.decorators import api_view
from rest_framework.response import Response

from django.db.models import Prefetch
from django.db.models import Q
from django.core.cache import cache

from django.contrib.postgres.search import TrigramSimilarity

from datetime import datetime
from PIL import Image
import requests
import base64
import random
import json
import math
import re

@api_view (['GET'])
def dashboard(request):
    top_5_steam_peak = VideoGame.objects.prefetch_related(
        Prefetch("media", queryset = MediaContent.objects.filter(
            Q(media_type = MediaType.SCREENSHOT) |
            Q(media_type = MediaType.ARTWORK, artwork_type__in = [ArtworkType.KEY_ART_NO_LOGO, ArtworkType.ARTWORK]))),
        Prefetch("game_companies", queryset = GameCompany.objects.filter(
                developer = True)),
        Prefetch("game_releases", queryset = GameRelease.objects.select_related("platform")),
        "game_companies__company"
    ).filter(
            game_popularity__popularity_type = PopularityType.STEAM_PEAK_PLAYERS
        ).order_by("-game_popularity__value")[:5]

    serialized_top_5 = DashboardSerializer(top_5_steam_peak, many = True)


    statistics = {
        "total games"      : VideoGame.objects.count(),
        "total franchises" : Franchise.objects.count(),
        "total companies"  : Company.objects.count(),
        "total media"      : MediaContent.objects.count(),
        "upcoming titles"  : VideoGame.objects.filter(game_releases__release_date__gt = datetime.now()).distinct().count()
    }


    data = {
        "trending" : serialized_top_5.data,
        "stats"    : statistics,
    }

    return Response(data)


@api_view(['GET'])
def gameDetails(request, id):
    try:
        video_game = VideoGame.objects.prefetch_related(
            Prefetch("game_companies", queryset = GameCompany.objects.select_related("company")),
            Prefetch("game_releases", queryset  = GameRelease.objects.select_related("platform", "region")),
            Prefetch("game_languages", queryset = GameLanguage.objects.select_related("language")),
            Prefetch("age_ratings", queryset    = AgeRating.objects.select_related("age_rating_org", "age_rating_cat")),
            "genres", "modes", "media",
        ).select_related("franchise").get(id = id)

        serialized_game_details = VideoGameDetailsSerializer(video_game)

        return Response(serialized_game_details.data)
    except VideoGame.DoesNotExist:
        return Response({"error": "Game not found"}, status = 404)


@api_view(['GET'])
def gameSearch(request):
    query = request.GET.get("q")

    if not query:
        return Response({"error": "expected input, found nothing"}, status = 400)

    video_games = (
        VideoGame.objects
        .annotate(similarity   = TrigramSimilarity("title", query))
        .filter(similarity__gt = 0.6)
        .order_by("-similarity")[:5]
    )

    serialized_video_game = VideoGameSerializer(video_games, many = True)

    return Response(serialized_video_game.data, status = 200)


_GUESSES_LEFT    = 3
_HINTS_REMAINING = 3
_PIXEL_LEVEL     = 2
@api_view(['GET', 'POST'])
def guessGame(request) -> Response:
    if request.method == 'GET':
        difficulty = request.GET.get("difficulty")
        dlcs = request.GET.get("dlcs")  # query params

        difficulty_criteria = {
            "easy"   : {"rating_count" : 1500},
            "medium" : {"rating_count" : 1000},
            "hard"   : {"rating_count" : 500},
        }

        if difficulty not in difficulty_criteria:
            return Response({"difficulty": "Invalid difficulty"}, status = 404)

        main_qs = (
            VideoGame.objects
            .filter(
                rating_count__gte = difficulty_criteria[difficulty]["rating_count"],
                game_type         = GameType.MAIN,
            )
            .prefetch_related(
                Prefetch("game_companies", queryset = GameCompany.objects.select_related("company")),
                Prefetch("game_releases", queryset  = GameRelease.objects.select_related("platform", "region")),
                "genres"
            )
        )

        count = main_qs.count()  # we could default to doing Model.objects.order_by('?').first() but our model is too big --> slow
        if count == 0:
            return Response({"status": "Error"}, status = 404)

        idx = random.randint(0, count - 1)
        main_game = main_qs[idx]

        choice = main_game

        if dlcs and dlcs.lower() in ["true", "1"]:  # if user wants dlcs too, we draw dlcs related to main game we pulled only
            addons = list(
                main_game.addons
                .filter(game_type = GameType.DLC)
                .prefetch_related(
                    Prefetch("game_companies", queryset = GameCompany.objects.select_related("company")),
                    Prefetch("game_releases", queryset  = GameRelease.objects.select_related("platform", "region")),
                    "genres"
                )
            )
            addon_count = len(addons)

            if addon_count > 0:
                pool = random.choice(["main", "dlc"])

                if pool == "dlc":
                    choice = random.choice(addons)

        full_game_data = GuessTheGameSerializer(choice).data

        revealed_indices, summary_parts, summary_separator = _earlyReveal(difficulty, full_game_data)

        # store in redis
        request.session['gtg_state'] = {
            'game_id'           : choice.id,
            'difficulty'        : difficulty,
            'answer'            : re.sub(r'[^a-zA-Z0-9\s]', '', choice.title).lower(),
            'hints_remaining'   : _HINTS_REMAINING,
            'guesses_left'      : _GUESSES_LEFT,
            'cover_id'          : choice.cover,  # django auto-serializes the session cache to JSON; can't process raw bytes
            'revealed_fields'   : revealed_indices,
            'revealed_summary'  : summary_parts,
            'summary_separator' : summary_separator,
            'full_data'         : full_game_data
        }

        return Response(_build_safe_payload(
            full_game_data,
            revealed_indices,
            summary_parts,
            guesses_left  = request.session.get("gtg_state", {}).get("guesses_left"),
            hints_left    = request.session.get("gtg_state", {}).get("hints_remaining"),
            cover         = None  # front end will handle a placeholder separately
        ))

    else:
        state          = request.session.get('gtg_state')
        full_game_data = state.get("full_data")
        body           = json.loads(request.body)

        if "category" in body:
            category   = body["category"]
            index      = body["index"]

            revealed_fields  = state.get("revealed_fields")

            if state.get('hints_remaining', 0) <= 0:
                return Response({"error": "No hints remaining"}, status = 400)

            full_list     = _resolve_by_path(full_game_data, category)
            if isinstance(full_list, str): # means we hit summary, it is of type string [maybe, definitely not the best way to do this, but YOLO]
                full_list = split_summary(full_list, state.get("summary_separator"))

            revealed_list = _resolve_by_path(revealed_fields, category)

            if index is not None:
                target = index
            else:
                unrevealed = [i for i in range(len(full_list)) if i not in revealed_list]
                if not unrevealed:
                    return Response({"error": "Nothing left to reveal"}, status = 400)

                target = random.choice(unrevealed)

            if target not in revealed_list:
                revealed_list.append(target)

            state['hints_remaining']    -= 1
            state['revealed_fields']     = revealed_fields
            request.session['gtg_state'] = state
            request.session.modified     = True

            summary_parts = state.get('revealed_summary', [])

            return Response({
                "payload"         : _build_safe_payload(
                    full_game_data,
                    revealed_fields,
                    summary_parts,
                ),
                "hints_left"      : state.get("hints_remaining"),
            })

        else:
            user_guess = body.get("guess", "")

            correct = re.sub(r'[^a-zA-Z0-9\s]', '', user_guess).lower() == state.get(
                "answer")

            if not correct:
                state["guesses_left"] = state.get("guesses_left", _GUESSES_LEFT) - 1
                request.session["gtg_state"] = state
                request.session.modified = True  # for some reason without this; the session doesn't update properly

            if state.get('guesses_left') <= 0 or correct:
                game_over = True

                revealed_indices, summary_parts, summary_separator = _earlyReveal(state.get("difficulty"), full_game_data, game_over)
                cover = _get_cover_bytes(state, game_over)

                request.session['gtg_state'] = state
                request.session.modified     = True

                return Response({
                    "over"         : game_over,
                    "guesses_left" : state.get("guesses_left"),
                    "payload"      : _build_safe_payload(
                        full_game_data,
                        revealed_indices,
                        summary_parts,
                        cover,
                        answer = state.get("answer")
                    )
                })

            cover = _get_cover_bytes(state, game_over = False)

            request.session['gtg_state'] = state  # persist cover cache set inside _get_cover_bytes
            request.session.modified     = True

            return Response({"incorrect": "wrong guess!",
                             "payload": cover}, status = 200)


@api_view(['GET'])
def guessGameCover(request) -> Response:
    state = request.session.get('gtg_state')

    if not state:
        return Response({"cover": None}, status = 400)

    cover = _get_cover_bytes(state)

    return Response({"cover": cover})


def _build_safe_payload(full_game_data, revealed_indices, summary_parts, cover = None, answer = None, guesses_left = None, hints_left = None):
    payload = {
        "game_type": full_game_data["game_type"],

        "release_date": revealed_indices["release_date"],

        "summary": [
            {"text": part, "revealed": True} if i in revealed_indices["summary"]
            else {"text": _mask_text(part), "revealed": False}
            for i, part in enumerate(summary_parts)
        ],

        "genres": [
            {"name": genre["name"], "revealed": True} if i in revealed_indices["genres"]
            else {"name": _mask_text(genre["name"]), "revealed": False}
            for i, genre in enumerate(full_game_data.get("genres", []))
        ],

        "companies": {
            "developers": [
                {"name": dev["name"], "revealed": True} if i in revealed_indices["companies"]["developers"]
                else {"name": _mask_text(dev["name"]), "revealed": False}
                for i, dev in enumerate(full_game_data.get("companies", {}).get("developers", []))
            ],
            "publishers": [
                {"name": pub["name"], "revealed": True} if i in revealed_indices["companies"]["publishers"]
                else {"name": _mask_text(pub["name"]), "revealed": False}
                for i, pub in enumerate(full_game_data.get("companies", {}).get("publishers", []))
            ]
        }
    }

    if cover:
        payload["cover"] = cover

    if answer:
        payload["title"] = answer

    if guesses_left:
        payload["guesses_left"] = guesses_left

    if hints_left:
        payload["hints_left"] = hints_left

    return payload


def _get_cover_bytes(state, game_over = False):
    if not state:
        return None

    cover_id = state.get("cover_id")
    if not cover_id:
        return None

    cache_key   = f"gtg_cover_{cover_id}"
    cover_bytes = cache.get(cache_key)

    if cover_bytes is None:
        try:
            resp = requests.get(utils.construct_igdb_url(cover_id), timeout = 5)
            resp.raise_for_status()

            cover_bytes = resp.content
            cache.set(cache_key, cover_bytes, timeout = 3600)
        except requests.exceptions.RequestException:
            return None

    if game_over:  # skip pixelation entirely; return raw cover
        return _encode_b64(cover_bytes)

    guesses_left = state.get("guesses_left", _GUESSES_LEFT)
    pixelated    = _pixelate_cover(cover_bytes, guesses_left)

    return _encode_b64(pixelated)

def _earlyReveal(difficulty: str, choice: dict, game_over: bool = False) -> tuple[dict, list, str]:
    reveal_percentage = 0.0
    summary_separator = ""
    summary_text      = (choice.get("summary") or "").strip()
    summary_parts     = []
    release_date      = (choice.get("release_date") or "").split("-")
    title             = choice.get("title") or ""

    match difficulty:
        case "easy":
            reveal_percentage = 0.30
            summary_separator = "."
            summary_parts = split_summary(summary_text, summary_separator)
        case "medium":
            reveal_percentage = 0.15
            summary_separator = ".,"
            summary_parts = split_summary(summary_text, summary_separator)
            if len(release_date) > 2:
                release_date[2] = "xx"
        case "hard":
            reveal_percentage = 0.0
            summary_separator = ".,"
            summary_parts = split_summary(summary_text, summary_separator)
            if len(release_date) > 1:
                release_date[1] = "xx"
            if len(release_date) > 2:
                release_date[2] = "xx"

    formatted_date = "-".join(release_date)

    pool = []

    genres_len = len(choice.get("genres", []))
    for i in range(genres_len):
        pool.append(("genres", i))

    companies = choice.get("companies", {})
    devs_len  = len(companies.get("developers", []))
    for i in range(devs_len):
        pool.append(("developers", i))

    pubs_len = len(companies.get("publishers", []))
    for i in range(pubs_len):
        pool.append(("publishers", i))

    summary_len = len(summary_parts)
    for i in range(summary_len):
        pool.append(("summary", i))

    if game_over:
        return {
            "release_date": choice.get("release_date") or "",
            "genres": list(range(genres_len)),
            "companies": {
                "developers": list(range(devs_len)),
                "publishers": list(range(pubs_len)),
            },
            "summary": list(range(summary_len)),
        }, summary_parts, summary_separator


    total_items = len(pool)
    if total_items == 0:
        return {"release_date": "", "genres": [], "companies": {"developers": [], "publishers": []}, "summary": []}, summary_parts, summary_separator

    count_to_reveal = math.ceil(total_items * reveal_percentage)
    selected_items  = random.sample(pool, count_to_reveal)

    # for any selected summary part that contains the game title, swap it out
    selected_summary_indices = {idx for cat, idx in selected_items if cat == "summary"}

    for i, (category, idx) in enumerate(selected_items):
        if category != "summary":
            continue
        if not _contains_title(summary_parts[idx], title):
            continue

        # find summary indices not already selected and not containing the title
        safe_replacements = [
            j for j in range(summary_len)
            if j not in selected_summary_indices
            and not _contains_title(summary_parts[j], title)
        ]

        if safe_replacements:
            replacement = random.choice(safe_replacements)
            selected_items[i] = ("summary", replacement)
            selected_summary_indices.discard(idx)
            selected_summary_indices.add(replacement)
        else:
            # no safe swap available — just drop this one, don't reveal it
            selected_items[i] = None

    selected_items = [item for item in selected_items if item is not None]

    result = {
        "release_date" : formatted_date,
        "genres"       : [],
        "companies"    : {"developers": [], "publishers": []},
        "summary"      : []
    }

    for category, idx in selected_items:
        if category == "genres":
            result["genres"].append(idx)
        elif category == "developers":
            result["companies"]["developers"].append(idx)
        elif category == "publishers":
            result["companies"]["publishers"].append(idx)
        elif category == "summary":
            result["summary"].append(idx)

    return result, summary_parts, summary_separator


def split_summary(summary: str, summary_separator: str):
    summary_parts = re.split(rf"(?<=[{summary_separator}])\s*", summary)

    return [sentence for sentence in summary_parts if sentence] # sentences ending with a full stop, GET EM' OUT!


def _title_tokens(title: str) -> set[str]:
    """
    tokenizing a title e.g. Warcraft III: Reign of Chaos -> {warcraft, reigns, of, chaos}
    I do this because Warcraft III != Warfcraft 3
    """
    words = re.sub(r'[^\w\s]', '', title.lower()).split()
    return {
        w for w in words
        if not re.fullmatch(r'[ivxlcdm]+', w)  # drop roman numerals
        and not re.fullmatch(r'\d+', w)          # drop arabic numerals
    }


def _contains_title(text: str, title: str) -> bool:
    if not title:
        return False
    tokens = _title_tokens(title)
    if not tokens:
        return False
    text_lower = text.lower()
    return all(re.search(r'\b' + re.escape(token) + r'\b', text_lower) for token in tokens)


def _mask_text(text: str) -> str:
    # replace len(text) with len(x) that way the front end stays consistent when unredacting, (no layout shifts)
    return 'x' * len(text)


def _pixelate_cover(img_bytes: bytes, guesses_left: int, game_over: bool = False) -> bytes | None:
    if img_bytes is None:
        return None

    img = Image.open(BytesIO(img_bytes)).convert("RGB")

    if game_over:
        out = img  # full res
    else:
        guesses_used = _GUESSES_LEFT - guesses_left
        block_size   = _PIXEL_LEVEL * (2 ** (guesses_used + 1))

        if block_size is None:
            out = img
        else:
            original_size = img.size
            small = img.resize((block_size, block_size), Image.NEAREST)
            out = small.resize(original_size, Image.NEAREST)

    buffer = BytesIO()
    out.save(buffer, format = "JPEG", quality = 85)
    return buffer.getvalue()


def _encode_b64(img_bytes: bytes | str) -> str:
    if isinstance(img_bytes, str):
        return img_bytes

    return base64.b64encode(img_bytes).decode("utf-8")


def _resolve_by_path(obj, path):
    # front end sends a hint category, but since not all hint categories belong to the same object level;
    # for deeper categories we need their parent keys too to traverse down
    for key in path:
        obj = obj[key]
    return obj