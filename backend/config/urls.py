from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

admin.site.site_header = "Kusajilisha administration"
admin.site.site_title = "Kusajilisha admin"
admin.site.index_title = "Site administration"
admin.site.site_url = "/"


api_urlpatterns = [
    path("auth/", include("users.urls")),
    path("properties/", include("properties.urls")),
    path("bookings/", include("bookings.urls")),
    path("payments/", include("payments.urls")),
    path("reviews/", include("reviews.urls")),
    path("chat/", include("chat.urls")),
    path("taxi/", include("taxi.urls")),
    path("agents/", include("agents.urls")),
    path("packages/", include("packages.urls")),
    path("destinations/", include("destinations.urls")),
    path("ai/", include("chat.ai_urls")),
    path("rbac/", include("roles.urls")),
]

urlpatterns = [
    path("healthz/", lambda request: JsonResponse({"status": "ok"}), name="healthz"),
    path("admin/", admin.site.urls),
    path("api/", include(api_urlpatterns)),
    *api_urlpatterns,
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
