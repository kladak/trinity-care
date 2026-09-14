"""Synthetic seed data — fictional names only, no real PHI."""

from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models import (
    Facility,
    FamilyResidentLink,
    Resident,
    Update,
    User,
    Visit,
)
from app.services.auth import hash_password

DEMO_PASSWORD = "demo1234"


def seed_if_empty(db: Session) -> None:
    if db.query(User).first():
        return

    facility = Facility(
        name="Willow Grove Assisted Living (Demo Facility)",
        location="Ann Arbor, MI — synthetic location",
    )
    db.add(facility)
    db.flush()

    staff = User(
        email="staff@demo.trinitycare.local",
        display_name="Alex Rivera (Staff Demo)",
        role="facility_staff",
        hashed_password=hash_password(DEMO_PASSWORD),
        facility_id=facility.id,
    )
    staff2 = User(
        email="staff2@demo.trinitycare.local",
        display_name="Priya Shah (Staff Demo)",
        role="facility_staff",
        hashed_password=hash_password(DEMO_PASSWORD),
        facility_id=facility.id,
    )
    family = User(
        email="family@demo.trinitycare.local",
        display_name="Jordan Lee (Family Demo)",
        role="family",
        hashed_password=hash_password(DEMO_PASSWORD),
        facility_id=None,
    )
    family2 = User(
        email="family2@demo.trinitycare.local",
        display_name="Sam Chen (Family Demo)",
        role="family",
        hashed_password=hash_password(DEMO_PASSWORD),
        facility_id=None,
    )
    db.add_all([staff, staff2, family, family2])
    db.flush()

    residents = [
        Resident(
            display_name="Margaret Ellison (Synthetic)",
            facility_id=facility.id,
            room="214B",
            care_notes="Enjoys afternoon puzzles and garden walks. Demo profile only — not real PHI.",
        ),
        Resident(
            display_name="Harold Nguyen (Synthetic)",
            facility_id=facility.id,
            room="108A",
            care_notes="Prefers morning visits; likes chess. Demo profile only.",
        ),
        Resident(
            display_name="Eleanor Brooks (Synthetic)",
            facility_id=facility.id,
            room="301C",
            care_notes="Loves classical music and tea time. Demo profile only.",
        ),
        Resident(
            display_name="Robert Okonkwo (Synthetic)",
            facility_id=facility.id,
            room="220A",
            care_notes="Follows college basketball; weekly family calls. Demo profile only.",
        ),
        Resident(
            display_name="Dorothy Kim (Synthetic)",
            facility_id=facility.id,
            room="115B",
            care_notes="Participates in art studio on Thursdays. Demo profile only.",
        ),
    ]
    db.add_all(residents)
    db.flush()

    db.add_all(
        [
            FamilyResidentLink(
                family_user_id=family.id,
                resident_id=residents[0].id,
                relationship_label="Daughter (demo)",
            ),
            FamilyResidentLink(
                family_user_id=family.id,
                resident_id=residents[1].id,
                relationship_label="Nephew (demo)",
            ),
            FamilyResidentLink(
                family_user_id=family.id,
                resident_id=residents[3].id,
                relationship_label="Family friend (demo)",
            ),
            FamilyResidentLink(
                family_user_id=family2.id,
                resident_id=residents[2].id,
                relationship_label="Son (demo)",
            ),
            FamilyResidentLink(
                family_user_id=family2.id,
                resident_id=residents[4].id,
                relationship_label="Granddaughter (demo)",
            ),
        ]
    )

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    synthetic_updates = [
        (0, staff.id, "check_in", "Margaret joined the garden club this morning and seemed cheerful. (Synthetic demo note)", 28),
        (0, staff.id, "update", "Afternoon snack was blueberry muffins — she asked for the recipe. (Synthetic)", 20),
        (0, staff2.id, "message", "Shared photos from last week's family day; she smiled through the album. (Synthetic)", 12),
        (0, staff.id, "check_in", "Quiet evening; finished a crossword with a neighbor. (Synthetic)", 4),
        (1, staff.id, "message", "Harold completed his morning stretch group. Energy looked good. (Synthetic)", 26),
        (1, staff2.id, "check_in", "Won two chess games in the lounge. Competitive as ever. (Synthetic)", 18),
        (1, staff.id, "update", "Ate well at lunch; asked about weekend visitors. (Synthetic)", 8),
        (2, staff.id, "check_in", "Eleanor listened to a Beethoven playlist and shared stories with neighbors. (Synthetic)", 22),
        (2, staff2.id, "update", "Tea time favorite: chamomile. Chatted about her teaching years. (Synthetic)", 10),
        (3, staff.id, "check_in", "Robert watched the game in the community room — good spirits. (Synthetic)", 16),
        (3, staff2.id, "message", "Phone call with family went well this afternoon. (Synthetic)", 6),
        (4, staff.id, "update", "Dorothy painted a watercolor landscape in art studio. Proud of her work. (Synthetic)", 14),
        (4, staff2.id, "check_in", "Morning walk in the courtyard; weather was mild. (Synthetic)", 2),
    ]
    for idx, author_id, utype, body, hours_ago in synthetic_updates:
        db.add(
            Update(
                resident_id=residents[idx].id,
                author_id=author_id,
                update_type=utype,
                body=body,
                created_at=now - timedelta(hours=hours_ago),
            )
        )

    db.add_all(
        [
            Visit(
                resident_id=residents[0].id,
                requester_id=family.id,
                scheduled_at=now + timedelta(days=2, hours=14),
                notes="Weekend afternoon visit — bring photo album (demo).",
                status="confirmed",
            ),
            Visit(
                resident_id=residents[1].id,
                requester_id=family.id,
                scheduled_at=now + timedelta(days=5, hours=10),
                notes="Morning chess rematch (demo request).",
                status="requested",
            ),
            Visit(
                resident_id=residents[3].id,
                requester_id=family.id,
                scheduled_at=now + timedelta(days=1, hours=16),
                notes="Bring team jersey for the game (demo).",
                status="confirmed",
            ),
            Visit(
                resident_id=residents[2].id,
                requester_id=family2.id,
                scheduled_at=now + timedelta(days=3, hours=15),
                notes="Sunday tea visit (demo).",
                status="requested",
            ),
        ]
    )
    db.commit()
