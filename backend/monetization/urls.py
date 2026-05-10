from django.urls import path
from .views import (
    TransportPartnerListView,
    ReferralClickView,
    AdPlacementListView,
    FeaturedListingListView,
)

urlpatterns = [
    path("transport-partners/", TransportPartnerListView.as_view(), name="transport-partners"),
    path("referral-click/", ReferralClickView.as_view(), name="referral-click"),
    path("ad-placements/", AdPlacementListView.as_view(), name="ad-placements"),
    path("featured-listings/", FeaturedListingListView.as_view(), name="featured-listings"),
]
