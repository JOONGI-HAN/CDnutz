from datetime import timedelta
from django.utils import timezone
from middleman import Middleman
from dotenv import load_dotenv
import requests
import time
import os


load_dotenv("../../.env")

TWITCH_URL      = "https://id.twitch.tv/oauth2/token"
IGDB_BASE_URL   = "https://api.igdb.com/v4/"


class Wrapper:

    def __init__(self):

        self.middleman     = Middleman()

        self.access_token  = self.middleman.read_secret("igdb")
        self.clientID      = os.getenv("client_id")
        self.client_secret = os.getenv("client_secret")
        self.max_tries     = 3

    def _make_request(self, url, **kwargs):

        attempts        = 0
        time_interval   = 2

        while attempts < self.max_tries:

            try:

                response = requests.post(url, **kwargs)
                response.raise_for_status()

                return response.json()

            except requests.exceptions.HTTPError as e:

                attempts    += 1
                status      = response.status_code

                if (
                    status == 401
                    and url != TWITCH_URL
                    and attempts == 1
                ):  # expired token

                    self.twitch_auth()

                    if "headers" in kwargs:

                        kwargs["headers"]["Authorization"] = (
                            f"Bearer {self.access_token}"
                        )

                    continue

                if 400 <= status < 500:

                    raise ValueError(
                        f"Client error: {status} - {response.text}"
                    )

                if attempts < self.max_tries:

                    time.sleep(time_interval)
                    time_interval *= 2

                else:

                    raise ValueError(
                        f"Request failed after {self.max_tries} attempts: {e}"
                    )

            except requests.exceptions.RequestException as e:

                raise ValueError(f"Network error: {e}")

    def twitch_auth(self):

        params = {
            "client_id"       : self.clientID,
            "client_secret"   : self.client_secret,
            "grant_type"      : "client_credentials",
        }

        data = self._make_request(
            TWITCH_URL,
            params = params
        )

        expiry_date = (
            timezone.now()
            + timedelta(seconds = data["expires_in"])
        )

        self.middleman.write_secret(
            "igdb",
            data["access_token"],
            expiry = expiry_date,
        )

        self.access_token = data["access_token"]

    def IGDB_request(self, endpoint, query):

        if not self.access_token:

            self.twitch_auth()

        url = f"{IGDB_BASE_URL}{endpoint}"

        headers = {
            "Client-ID"       : self.clientID,
            "Authorization"   : f"Bearer {self.access_token}",
            "Content-Type"    : "text/plain",
        }

        return self._make_request(
            url,
            headers = headers,
            data    = query
        )
