from rest_framework import serializers

from .models import Destination


DESTINATION_GUIDES = {
    "zanzibar": {
        "eyebrow": "Island stays",
        "headline": "Stay in Zanzibar",
        "subtitle": "Beachfront, culture, kite-surfing and island experiences.",
        "areas": [
            {
                "title": "Stone Town",
                "label": "Culture + history",
                "copy": "Walk to old Arabic-Swahili architecture, carved doors, markets and waterfront sunsets.",
            },
            {
                "title": "Nungwi & Kendwa",
                "label": "Beach + nightlife",
                "copy": "Clear turquoise water, swimmable beaches and premium resort energy.",
            },
            {
                "title": "Paje",
                "label": "Young + active",
                "copy": "Kite surfing, cafes and digital nomad stays with more budget-friendly options.",
            },
            {
                "title": "Jambiani",
                "label": "Quiet + authentic",
                "copy": "Peaceful village feel, relaxed long stays and less crowded beaches.",
            },
        ],
        "highlights": [
            "Beachfront apartments",
            "Kite-surfing beaches",
            "Cultural Stone Town stays",
            "Luxury ocean-view villas",
        ],
    },
    "dar-es-salaam": {
        "eyebrow": "Coastal city stays",
        "headline": "Stay in Dar es Salaam",
        "subtitle": "Business-ready apartments, premium coastal zones and affordable long stays.",
        "areas": [
            {
                "title": "Masaki & Oyster Bay",
                "label": "Premium zone",
                "copy": "Restaurants, embassies, nightlife and ocean access for business travelers and expats.",
            },
            {
                "title": "Msasani Peninsula",
                "label": "Residential + leisure",
                "copy": "A strong balance of city access, beach access and comfortable mid to high-end living.",
            },
            {
                "title": "Mikocheni / Kinondoni",
                "label": "Affordable urban",
                "copy": "Practical city stays for long visits, work trips and budget-conscious travelers.",
            },
            {
                "title": "Kigamboni",
                "label": "Quiet coastal escape",
                "copy": "Beachside living away from city noise, with growing development and calm surroundings.",
            },
        ],
        "highlights": [
            "Business-ready apartments",
            "Near restaurants and embassies",
            "Affordable long-stay apartments",
            "Quiet coastal escapes",
        ],
    },
}


def resolve_destination_guide(obj):
    key = f"{obj.destination_slug} {obj.destination_name}".lower()
    if "zanzibar" in key:
        return DESTINATION_GUIDES["zanzibar"]
    if "dar" in key or "salaam" in key:
        return DESTINATION_GUIDES["dar-es-salaam"]
    return None


class DestinationSerializer(serializers.ModelSerializer):
    guide = serializers.SerializerMethodField()

    class Meta:
        model = Destination
        fields = (
            "destination_id",
            "country",
            "region",
            "destination_name",
            "destination_slug",
            "destination_type",
            "tourism_category",
            "guide",
            "is_featured",
            "is_active",
        )

    def get_guide(self, obj):
        return resolve_destination_guide(obj)
