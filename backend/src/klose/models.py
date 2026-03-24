from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, func
from .database import Base


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True)
    name = Column(String(300), nullable=False)
    phone = Column(String(50))
    email = Column(String(300))
    source = Column(String(100), default="Walk-in")
    status = Column(String(50), default="new")
    intent_score = Column(Float, default=0)
    budget_min = Column(Float)
    budget_max = Column(Float)
    preferred_bhk = Column(String(20))
    preferred_location = Column(String(200))
    notes = Column(Text)
    assigned_to = Column(Integer, ForeignKey("team_members.id"), nullable=True)
    avatar_url = Column(String(500))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True)
    name = Column(String(300), nullable=False)
    developer = Column(String(200))
    location = Column(String(300))
    type = Column(String(50), default="Apartment")
    bhk = Column(String(20))
    price_min = Column(Float)
    price_max = Column(Float)
    carpet_area = Column(Integer)
    rera_number = Column(String(100))
    rera_verified = Column(Boolean, default=False)
    status = Column(String(50), default="available")
    construction_status = Column(String(50), default="ready")
    amenities = Column(Text, default="[]")
    image_url = Column(String(500))
    description = Column(Text)
    created_at = Column(DateTime, default=func.now())


class SiteVisit(Base):
    __tablename__ = "site_visits"

    id = Column(Integer, primary_key=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    agent_id = Column(Integer, ForeignKey("team_members.id"))
    scheduled_at = Column(DateTime)
    status = Column(String(50), default="pending")
    feedback = Column(Text)
    rating = Column(Integer)
    created_at = Column(DateTime, default=func.now())


class Deal(Base):
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=True)
    stage = Column(String(50), default="lead_capture")
    value = Column(Float)
    probability = Column(Integer, default=10)
    expected_close = Column(DateTime, nullable=True)
    notes = Column(Text)
    assigned_to = Column(Integer, ForeignKey("team_members.id"), nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


class ChannelPartner(Base):
    __tablename__ = "channel_partners"

    id = Column(Integer, primary_key=True)
    name = Column(String(300), nullable=False)
    company = Column(String(300))
    phone = Column(String(50))
    email = Column(String(300))
    tier = Column(String(20), default="bronze")
    total_leads = Column(Integer, default=0)
    total_deals = Column(Integer, default=0)
    total_commission = Column(Float, default=0)
    conversion_rate = Column(Float, default=0)
    avatar_url = Column(String(500))
    created_at = Column(DateTime, default=func.now())


class Commission(Base):
    __tablename__ = "commissions"

    id = Column(Integer, primary_key=True)
    partner_id = Column(Integer, ForeignKey("channel_partners.id"), nullable=False)
    deal_id = Column(Integer, ForeignKey("deals.id"), nullable=True)
    ref_number = Column(String(50))
    description = Column(String(300))
    amount = Column(Float)
    status = Column(String(50), default="pending")
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())


class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True)
    name = Column(String(300), nullable=False)
    role = Column(String(100))
    phone = Column(String(50))
    email = Column(String(300))
    active_leads = Column(Integer, default=0)
    deals_closed = Column(Integer, default=0)
    revenue = Column(Float, default=0)
    capacity_pct = Column(Integer, default=0)
    avatar_url = Column(String(500))
    created_at = Column(DateTime, default=func.now())


class NegotiationChat(Base):
    __tablename__ = "negotiation_chats"

    id = Column(Integer, primary_key=True)
    deal_id = Column(Integer, ForeignKey("deals.id"), nullable=False)
    messages = Column(Text, default="[]")
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


class BankRate(Base):
    __tablename__ = "bank_rates"

    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    code = Column(String(20))
    floating_rate_min = Column(Float)
    floating_rate_max = Column(Float)
    max_tenure = Column(Integer)
    processing_fee = Column(String(100))
    category = Column(String(50), default="Preferred")
    color = Column(String(20))


class Setting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(Text)
