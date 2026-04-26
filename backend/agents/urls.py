from django.urls import path

from .views import AgentProfileListView


urlpatterns = [
    path("profiles/", AgentProfileListView.as_view(), name="agent-profile-list"),
]
