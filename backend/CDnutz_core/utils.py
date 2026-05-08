IGDB_STATIC_ENDPOINT = "https://images.igdb.com/igdb/image/upload/t_thumb/"
YOUTUBE_VIDEO_ENDPOINT = "https://www.youtube.com/embed/"

def construct_igdb_url(media_id, resolution = "1080p", extension = "jpg"):
    if not media_id:
        return None
    return (IGDB_STATIC_ENDPOINT + media_id + "." + extension).replace("thumb", resolution)

def construct_youtube_url(video_id):
    if not video_id:
        return None
    return YOUTUBE_VIDEO_ENDPOINT + video_id
