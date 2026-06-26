from django.urls import path
from . import views

urlpatterns = [
    path('api/dashboard/', views.dashboard, name                 = 'dashboard'),
    path('api/game/<int:id>/', views.gameDetails, name           = 'game'),
    path('api/guess-the-game/', views.guessGame, name            = 'guess'),
    path('api/guess-the-game/cover/', views.guessGameCover, name = 'guess-cover')
]
