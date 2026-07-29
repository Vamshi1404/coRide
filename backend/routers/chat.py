from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from database import fetch, fetchrow, execute
from auth import get_current_user

router = APIRouter(prefix="/api/chat", tags=["chat"])

class MessageCreate(BaseModel):
    content: str

@router.get("/{ride_id}")
async def get_messages(
    ride_id: str,
    after_id: Optional[str] = Query(None),
    user_id: str = Depends(get_current_user),
):
    # Check user is participant
    participant = await fetchrow(
        "SELECT id FROM ride_participants WHERE ride_id = $1 AND user_id = $2",
        ride_id, user_id,
    )
    owner = await fetchrow("SELECT owner_id FROM rides WHERE id = $1", ride_id)
    if not participant and (not owner or owner["owner_id"] != user_id):
        raise HTTPException(status_code=403, detail="Not a participant of this ride")

    if after_id:
        after = await fetchrow(
            "SELECT created_at FROM chat_messages WHERE id = $1 AND ride_id = $2",
            after_id, ride_id,
        )
        if after:
            rows = await fetch(
                """SELECT cm.*, u.name as sender_name
                   FROM chat_messages cm
                   JOIN users u ON u.id = cm.sender_id
                   WHERE cm.ride_id = $1 AND cm.created_at > $2
                   ORDER BY cm.created_at ASC""",
                ride_id, after["created_at"],
            )
        else:
            rows = []
    else:
        rows = await fetch(
            """SELECT cm.*, u.name as sender_name
               FROM chat_messages cm
               JOIN users u ON u.id = cm.sender_id
               WHERE cm.ride_id = $1
               ORDER BY cm.created_at ASC""",
            ride_id,
        )
    return [dict(r) for r in rows]

@router.post("/{ride_id}")
async def send_message(ride_id: str, req: MessageCreate, user_id: str = Depends(get_current_user)):
    if not req.content.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    participant = await fetchrow(
        "SELECT id FROM ride_participants WHERE ride_id = $1 AND user_id = $2",
        ride_id, user_id,
    )
    owner = await fetchrow("SELECT owner_id FROM rides WHERE id = $1", ride_id)
    if not owner:
        raise HTTPException(status_code=404, detail="Ride not found")
    if not participant and owner["owner_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not a participant of this ride")

    row = await fetchrow(
        """WITH inserted AS (
             INSERT INTO chat_messages (ride_id, sender_id, content)
             VALUES ($1, $2, $3)
             RETURNING *
           )
           SELECT i.*, u.name as sender_name
           FROM inserted i
           JOIN users u ON u.id = i.sender_id""",
        ride_id, user_id, req.content.strip()[:500],
    )
    return dict(row)

@router.get("/conversations/list")
async def get_conversations(user_id: str = Depends(get_current_user)):
    rows = await fetch(
        """
        SELECT DISTINCT ON (r.id)
            r.id AS ride_id,
            r.from_city,
            r.to_city,
            r.status,
            r.departure_time,
            CASE
                WHEN r.owner_id = $1 THEN COALESCE(
                    (SELECT u.name FROM ride_requests rr JOIN users u ON u.id = rr.passenger_id WHERE rr.ride_id = r.id AND rr.status = 'accepted' LIMIT 1),
                    'Passenger'
                )
                ELSE (SELECT u.name FROM users u WHERE u.id = r.owner_id)
            END AS name,
            cm.content AS last_message,
            cm.created_at AS last_message_time
        FROM rides r
        LEFT JOIN LATERAL (
            SELECT content, created_at
            FROM chat_messages
            WHERE ride_id = r.id
            ORDER BY created_at DESC
            LIMIT 1
        ) cm ON true
        WHERE
            r.owner_id = $1
            OR EXISTS (
                SELECT 1 FROM ride_participants rp WHERE rp.ride_id = r.id AND rp.user_id = $1
            )
            OR EXISTS (
                SELECT 1 FROM ride_requests rr WHERE rr.ride_id = r.id AND rr.passenger_id = $1 AND rr.status = 'accepted'
            )
        ORDER BY r.id, cm.created_at DESC NULLS LAST
        """,
        user_id,
    )
    # Sort final result list by last_message_time DESC
    result = [dict(r) for r in rows]
    result.sort(key=lambda x: x.get("last_message_time") or datetime.min.replace(tzinfo=timezone.utc), reverse=True)
    return result