from destinations.models import Destination


def _norm(text):
    return (text or "").strip().lower()


def infer_destination_for_property(prop, destinations=None):
    """
    Try to infer the best destination match for a property using:
    town -> location contains destination -> region/country hints.
    Returns a Destination instance or None.
    """
    if destinations is None:
        destinations = list(Destination.objects.filter(is_active=True))

    town = _norm(getattr(prop, "town", ""))
    region = _norm(getattr(prop, "region", ""))
    country = _norm(getattr(prop, "country", ""))
    location = _norm(getattr(prop, "location", ""))

    # 1) exact town match (strongest signal)
    if town:
        exact = [d for d in destinations if _norm(d.destination_name) == town]
        if country:
            exact_country = [d for d in exact if _norm(d.country) == country]
            if exact_country:
                return exact_country[0]
        if region:
            exact_region = [d for d in exact if _norm(d.region) == region]
            if exact_region:
                return exact_region[0]
        if exact:
            return exact[0]

    # 2) location contains destination name
    if location:
        contains = [d for d in destinations if _norm(d.destination_name) in location]
        if country:
            contains_country = [d for d in contains if _norm(d.country) == country]
            if contains_country:
                return contains_country[0]
        if region:
            contains_region = [d for d in contains if _norm(d.region) == region]
            if contains_region:
                return contains_region[0]
        if contains:
            return contains[0]

    # 3) fallback: exact region+country to featured destination
    if region:
        regional = [d for d in destinations if _norm(d.region) == region]
        if country:
            regional = [d for d in regional if _norm(d.country) == country]
        featured = [d for d in regional if d.is_featured]
        if featured:
            return featured[0]
        if regional:
            return regional[0]

    return None
