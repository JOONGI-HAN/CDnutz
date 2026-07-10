from .models import CustomUser

from .backends import  CustomAuthenticationBackend

from rest_framework.decorators import api_view
from rest_framework.response import Response

import json


@api_view(["POST"])
def login(request):
    body = json.loads(request.body)

    identifier = body["identifier"]
    password   = body["password"]

    backend = CustomAuthenticationBackend()

    user = backend.authenticate(request = request, username = identifier, password = password)

    if user:
        return Response({"status" : 200})

    return Response({"status" : 401, "result" : "Identifier or password is incorrect"})