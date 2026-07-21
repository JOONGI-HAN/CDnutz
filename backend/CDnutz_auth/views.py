from .backends import  CustomAuthenticationBackend
from .serializers import UserRegistrationSerializer

from rest_framework.decorators import api_view
from rest_framework.response import Response

import json


@api_view(["POST"])
def login(request):
    body = json.loads(request.body)

    identifier = body["identifier"]
    password   = body["password"]

    backend = CustomAuthenticationBackend()
    user    = backend.authenticate(request = request, username = identifier, password = password)

    if user:
        return Response(
            {
                "result" : "User authenticated successfully"
            },
            status = 200
        )

    return Response(
   {
            "result" : "Identifier or password incorrect"
        },
        status = 400
    )


@api_view(["POST"])
def register(request):
    body = json.loads(request.body)
    serializer = UserRegistrationSerializer(data = body)

    serializer.is_valid(raise_exception = True)
    serializer.save()

    return Response(
   {
            'result' : "User successfully created."
        },
        status = 200
    )