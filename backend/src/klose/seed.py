"""Seed database with demo data for Klose CRM."""
import json
from datetime import datetime, timedelta
from sqlalchemy import select
from .database import async_session
from .models import (
    Lead, Property, SiteVisit, Deal, ChannelPartner,
    Commission, TeamMember, NegotiationChat, BankRate, Setting,
)


async def seed_database():
    async with async_session() as session:
        result = await session.execute(select(Lead).limit(1))
        if result.scalar():
            return  # already seeded

        now = datetime.utcnow()

        # ── Team Members (8) ──
        team = [
            TeamMember(id=1, name="Julian Vance", role="Senior Consultant", phone="+1-555-0101", email="julian@klose.io", active_leads=24, deals_closed=18, revenue=4200000, capacity_pct=85, avatar_url="https://lh3.googleusercontent.com/aida-public/AB6AXuDGNg7-KKndWs6PIJrAPnMfkXMb3vMq5zS2CxR-R5cxP6aLwohimDe2ybjN9ZdVUA_6Ew-kTomzj8F5Ot0-pW4g785_r6_iNwGtDtAm0-HVeTfk-nQJzob90zq3J6emfyeGEb0XZUcQahxASBOa-1zMvZCihGmk_3l39N5J_XUT-tC7p-5DqVqWiEoWO9Cli_-1Sd_aFGYbNHBJnnlS0GdHD9mM-IE496d6lZzgELaEl78qnhQDKdaS2Tldw_4EMw9TapjifeHKGBo"),
            TeamMember(id=2, name="Elena Rossi", role="Market Specialist", phone="+1-555-0102", email="elena@klose.io", active_leads=12, deals_closed=14, revenue=3800000, capacity_pct=40, avatar_url="https://lh3.googleusercontent.com/aida-public/AB6AXuBuPdimaZDQxq_3VtIk7AKEPwRU_2m1Q6N8Dd0OCSWeZRUwKLUD_8USL46W69a7krzraugW5ePYSTy4fcZu3_akGjC-LZ_1hpncDZUuON-PglABM-1S4Z_nqcKg94QE5hQt0wM40qpUJ3SJ6Vpyu2jy1V2kZuahW-pFMC43lP7VkJgDjwIH3jiOTAGJPG2iVf4iug_0OqUctwb0N-13nJTh2SIMk1Kw7fvpk1Q3gW15amy1biTHszlFoAIU7XVpWsfVenpJtxZ4HeI"),
            TeamMember(id=3, name="Marcus Thorne", role="Client Relations", phone="+1-555-0103", email="marcus@klose.io", active_leads=31, deals_closed=11, revenue=2900000, capacity_pct=95, avatar_url="https://lh3.googleusercontent.com/aida-public/AB6AXuBVtt9FIFtzrsEZrhAWlvkE7ch8Qq-gFU9GQJnJn75VALNyuoutP_iSD1Y0j4LeurW56j7EbnBg4W9jFzvolafGRZ8wcoSbrvDJnLOa1sckIPiU0hDaxlRmgkSpyz6oEOgrVumzp_1C0uiHyljoA2OxdgHDfu-Yrj0PhFQ250T77ClrGCqbcN6YWI4-4XyF-7XUCaNzIjTJqvmNMeU9CJg8n6PjjJ2Wbb5h02saQTRYr6dFmPXYm8sKeIVfvrCXmTg2d-yrSeeOvO4"),
            TeamMember(id=4, name="Sarah Jenkins", role="Sales Manager", phone="+1-555-0104", email="sarah@klose.io", active_leads=19, deals_closed=9, revenue=2100000, capacity_pct=65, avatar_url=""),
            TeamMember(id=5, name="David Chen", role="Luxury Specialist", phone="+1-555-0105", email="david@klose.io", active_leads=22, deals_closed=15, revenue=5600000, capacity_pct=75, avatar_url=""),
            TeamMember(id=6, name="Priya Sharma", role="Team Lead", phone="+1-555-0106", email="priya@klose.io", active_leads=8, deals_closed=22, revenue=6800000, capacity_pct=30, avatar_url=""),
            TeamMember(id=7, name="Alexander Thorne", role="New Business", phone="+1-555-0107", email="alex@klose.io", active_leads=15, deals_closed=6, revenue=1200000, capacity_pct=55, avatar_url=""),
            TeamMember(id=8, name="Julianne Moore", role="Closing Expert", phone="+1-555-0108", email="julianne@klose.io", active_leads=10, deals_closed=20, revenue=7200000, capacity_pct=45, avatar_url=""),
        ]
        session.add_all(team)

        # ── Leads (25) ──
        leads = [
            Lead(id=1, name="Julian Thorne", phone="+1-212-555-0001", email="julian.t@email.com", source="99acres", status="qualified", intent_score=94, budget_min=4200000, budget_max=5500000, preferred_bhk="4 BHK", preferred_location="Upper West Side, NY", assigned_to=1, avatar_url="https://lh3.googleusercontent.com/aida-public/AB6AXuCfNX9cEQ6B52oGBryngGomv5j8VXqMZNZxEh7MmC5tQlTticJiaK775BIdPzih2CloKk5tSlvkPeLNHbFolr5IljkoUFBFjep0vNuLDJmdPaYZbFStn1h8Gx7lzDz84UUd4uhGI5LZbM2wdB_REh1Lmi-LbSRO8hQF7Z59lnYTdE9PYgFYj4yQWYQhqL5PpwBpaMM3cpyNigxz8QySQDAXr4xUgwtlQEER7KnaINBDa4uuk16N_7RUFU7uwwnrl3_5qnKopwyLtx4"),
            Lead(id=2, name="Elena Rodriguez", phone="+1-305-555-0002", email="elena.r@email.com", source="Instagram", status="contacted", intent_score=72, budget_min=2800000, budget_max=3200000, preferred_bhk="3 BHK", preferred_location="Coconut Grove, FL", assigned_to=2, avatar_url="https://lh3.googleusercontent.com/aida-public/AB6AXuAnmU4H4pfKl0lrEl0GNmAA6pI4PmMkSye4Bg9ZaxXqcw5Ih2os5RdOLsB47FHGZkWPSTQxwbpp1T0HCqxQWYBFpDv_crHQw_Nz1QDhzePsk6_uJDLslPxkJXkxghdQwHVAqtwOEnvvn9wiwEfw553P0dVKyTyD72NIHpkAxhEWI3Ge-tuif5tQ4iqy2JjyYvk5Z1qHfmRchMqjESihOxLBBR99d4y642A0DlhyYXItL4oAMPaMdtnX5bmJiPJnSoe-spemPVEOG8M"),
            Lead(id=3, name="Marcus Vane", phone="+44-20-555-0003", email="marcus.v@email.com", source="MagicBricks", status="qualified", intent_score=88, budget_min=8500000, budget_max=10000000, preferred_bhk="5 BHK", preferred_location="Belgravia, London", assigned_to=5, avatar_url="https://lh3.googleusercontent.com/aida-public/AB6AXuCTjxggVse5KLoyplJ_3YTUFyYm3jDCoxOY-lqZ-k0rIFkauSy3Zq_JCTOLoI9tOG-ItHTKS94CejTZhcDmHwsn8OIrMg4teHz5Z3IRuVVoefsxDzNb17EYtzR47fzzBiJmf34Guk7TZaOACWeZAHjskgKecij9pGIfTAwz2xUfJNeLPZE4ROoepF4MO2rnrs9mhCVnVBP9ttupq5y6NJPBRQFqX82asAj2PtaT6FJh-HwyXSZlGskuPik8VTAzqbWswSh59h4qG2s"),
            Lead(id=4, name="Sasha Kim", phone="+82-2-555-0004", email="sasha.k@email.com", source="Walk-in", status="new", intent_score=45, budget_min=5500000, budget_max=7000000, preferred_bhk="3 BHK", preferred_location="Gangnam, Seoul", assigned_to=3, avatar_url="https://lh3.googleusercontent.com/aida-public/AB6AXuDXLOIdrnZH6ONBFDD5bg9eymWtYfwOMrnLvDeRdifVzqSNUnKZi3jINdQzVyM4M7fZP5VKnCSk4auXy9NwyKiDWem9ZyqO2CDECZCd-745OIXqLPRCavXG7ApP3ebNB7QPxx0SayhW_VBjIW3b8FkuIt6PokR3QmWUnsIxgyiqlrS1GCLdtegxvWMvqDAyDauTfMwosTd89jyEFZxbHMO-gKOm3a6y-2AOzNBt9uHH9k3ZhFVbZ4CLT9v5_vDx_Pf3zEDQeCwnnp0"),
            Lead(id=5, name="Arthur Pendergast", phone="+44-20-555-0005", email="arthur.p@email.com", source="Referral", status="site_visit", intent_score=61, budget_min=12000000, budget_max=15000000, preferred_bhk="6+ BHK", preferred_location="Mayfair, London", assigned_to=5, avatar_url="https://lh3.googleusercontent.com/aida-public/AB6AXuArUqNT1N01jjUTI13h794eOb4WjHAlQUudCucQgcfn3XPXjtwikseEs7jB0GkPCVObr2Ep_4AV2X89d9dz4JSuFbujZ02LMAVgeS3Iqm3rKoU9FS8GqfB0-1Kk3VWt4ZJmYn_irltIal4aUykBoDNFyoPaSwbrlZYijJKqviJMiJOlxpvG7oRW5WV7Gc9ybz9xu3O-gGMqTDxyFm2OebOu8QTqfOayuL8Eb-W_MOmrlw5Pg9pEHNmjobvoZIUbPRMcq41ajxCtPrY"),
            Lead(id=6, name="Julianna Vane", phone="+1-917-555-0006", email="julianna@email.com", source="WhatsApp", status="contacted", intent_score=78, budget_min=3500000, budget_max=4500000, preferred_bhk="3 BHK", preferred_location="Manhattan, NY", assigned_to=1),
            Lead(id=7, name="Marcus Sterling", phone="+1-310-555-0007", email="sterling@email.com", source="99acres", status="negotiation", intent_score=85, budget_min=4000000, budget_max=4500000, preferred_bhk="4 BHK", preferred_location="Bel Air, LA", assigned_to=8),
            Lead(id=8, name="Seraphina Vane", phone="+1-212-555-0008", email="seraphina@email.com", source="Instagram", status="new", intent_score=10, budget_min=700000, budget_max=900000, preferred_bhk="2 BHK", preferred_location="Brooklyn, NY", assigned_to=7),
            Lead(id=9, name="Victoria Hamilton", phone="+1-415-555-0009", email="victoria@email.com", source="Referral", status="won", intent_score=98, budget_min=5000000, budget_max=6000000, preferred_bhk="5 BHK", preferred_location="Pacific Heights, SF", assigned_to=8),
            Lead(id=10, name="Alexander Thorne", phone="+1-646-555-0010", email="alexthorne@email.com", source="Walk-in", status="new", intent_score=15, budget_min=400000, budget_max=500000, preferred_bhk="2 BHK", preferred_location="Williamsburg, NY", assigned_to=7),
            Lead(id=11, name="Julian Blackwood", phone="+1-312-555-0011", email="blackwood@email.com", source="MagicBricks", status="qualified", intent_score=35, budget_min=2000000, budget_max=2500000, preferred_bhk="3 BHK", preferred_location="Gold Coast, Chicago", assigned_to=2),
            Lead(id=12, name="Elena Rossi-Client", phone="+39-06-555-0012", email="erossi@email.com", source="99acres", status="site_visit", intent_score=50, budget_min=1500000, budget_max=2000000, preferred_bhk="3 BHK", preferred_location="Trastevere, Rome", assigned_to=4),
            Lead(id=13, name="David Park", phone="+82-10-555-0013", email="dpark@email.com", source="Social", status="contacted", intent_score=62, budget_min=3000000, budget_max=3800000, preferred_bhk="4 BHK", preferred_location="Gangnam, Seoul", assigned_to=3),
            Lead(id=14, name="Sophia Laurent", phone="+33-1-555-0014", email="slaurent@email.com", source="Referral", status="won", intent_score=95, budget_min=8000000, budget_max=9500000, preferred_bhk="5 BHK", preferred_location="16th Arr., Paris", assigned_to=5),
            Lead(id=15, name="Omar Hassan", phone="+91-22-555-0015", email="ohassan@email.com", source="Walk-in", status="qualified", intent_score=70, budget_min=60000000, budget_max=80000000, preferred_bhk="4 BHK", preferred_location="Worli, Mumbai", assigned_to=1),
            Lead(id=16, name="Liam O'Connor", phone="+353-1-555-0016", email="liam@email.com", source="MagicBricks", status="new", intent_score=25, budget_min=500000, budget_max=800000, preferred_bhk="2 BHK", preferred_location="Dublin 4", assigned_to=4),
            Lead(id=17, name="Aisha Patel", phone="+91-22-555-0017", email="aisha@email.com", source="99acres", status="contacted", intent_score=55, budget_min=1200000, budget_max=1800000, preferred_bhk="3 BHK", preferred_location="Bandra, Mumbai", assigned_to=6),
            Lead(id=18, name="Chen Wei", phone="+86-21-555-0018", email="cwei@email.com", source="Referral", status="site_visit", intent_score=68, budget_min=4500000, budget_max=5500000, preferred_bhk="4 BHK", preferred_location="Pudong, Shanghai", assigned_to=5),
            Lead(id=19, name="Isabella Costa", phone="+55-11-555-0019", email="icosta@email.com", source="Instagram", status="new", intent_score=30, budget_min=900000, budget_max=1200000, preferred_bhk="2 BHK", preferred_location="Jardins, SP", assigned_to=7),
            Lead(id=20, name="Raj Malhotra", phone="+91-11-555-0020", email="rajm@email.com", source="Walk-in", status="negotiation", intent_score=82, budget_min=3500000, budget_max=4200000, preferred_bhk="4 BHK", preferred_location="Golf Links, Delhi", assigned_to=8),
        ]
        session.add_all(leads)

        # ── Properties (15) ──
        props = [
            Property(id=1, name="Lodha Malabar", developer="Lodha Group", location="Malabar Hill, Mumbai", type="Villa", bhk="3, 4 & 5 BHK", price_min=42000000, price_max=68000000, carpet_area=6400, rera_number="MH-RE-2024-001", rera_verified=True, status="available", construction_status="ready", image_url="https://lh3.googleusercontent.com/aida-public/AB6AXuDjRkoR0C6nb1LEQhF4smFI5_kNT3SgTif2O4_Bh7rfJZ7nm9o0LVuDhNcW57lTbysKBolngM-kG9mP23UlIkrPiDLUMbfNHnswYX3JS3hZBshCeUg1syQyGbnJLFlPhlX4MDEwPY8nHM3PhbrfhtDd-kK6ymsIkQOFHlCUfaxsyWxvuIOD1A5hFsDk3mg22nwNyTFlIjbDwRLCvluW4zL1uhE--OHpP3IoU8z045DbSkuKj_49MUwEoOI2oxXOkLnE0TlE6I3JgU0", description="Ultra-luxury sea-facing residence on Mumbai's most prestigious hill."),
            Property(id=2, name="Sobha Dream Acres", developer="Sobha Ltd", location="Panathur, Bangalore", type="Villa", bhk="4 BHK", price_min=28000000, price_max=35000000, carpet_area=4200, rera_number="KA-RE-2024-002", rera_verified=True, status="available", construction_status="under_construction", image_url="https://lh3.googleusercontent.com/aida-public/AB6AXuCwka4lp9wdQSI9GHac6N5bsM48hrKsR7uy8reMghItXOo7ZWELn7s85gbIkKeSzMZx39T_g8ns0KU4uwy4yhOtRUjvvAAmpuv2xxuUkMqls299q715Flfbnm3---gNEZyDgvxaOBBsOAIVVSi3o9-oMPcdSj4TjGUsNqg65ToNQZqW-etlmwZmmSFeRdGP5l4w9AHkRF6w8OKbqGSGwyejf6a5U6DyvZ3Qmbcy7IwpbqPKTj_cQ4GIFpozNFfTmvgtJES2TFc_16Q", description="Contemporary villa with private garden in Bangalore's IT corridor."),
            Property(id=3, name="Prestige Shantiniketan", developer="Prestige Group", location="Whitefield, Bangalore", type="Apartment", bhk="2 & 3 BHK", price_min=12000000, price_max=24000000, carpet_area=1800, rera_number="KA-RE-2024-003", rera_verified=True, status="available", construction_status="ready", image_url="https://lh3.googleusercontent.com/aida-public/AB6AXuBek4ZBR9QBlokSByl976pLFMnnI19uOw6xczGsgAe6xtDldvDvw0yBKv5UpJogWMMuXnGWqo8qKn3Uk_7F3ak7o5FR6gDXk_W-1oLBMc-xboDCQeRtWznizSPMru15lpsreSkTgpE1KTrRfu2YLeK0jw7vSBLYsd_oL_KpVQA8XUqX26BN4Y6pkBDMyubWdnJO4igAfNyoWqP3sfXqiWbvKRZMusWQ1dSn322HpGfd4XWnruJE8PwgV0zib93OpgTBKNXcfUaWMxI", description="Panoramic city views from Bangalore's landmark township."),
            Property(id=4, name="DLF Magnolias", developer="DLF Ltd", location="Golf Course Road, Gurgaon", type="Villa", bhk="6+ BHK", price_min=120000000, price_max=180000000, carpet_area=12000, rera_number="HR-RE-2024-004", rera_verified=True, status="available", construction_status="ready", image_url="https://lh3.googleusercontent.com/aida-public/AB6AXuDD0RUt17vCKVk_n_v-DaB3JSdRCaPr28s63I9GDBCo4NemR91FCylDsoPvdoi4G-dR8fwgNYtS4tS1k64X19nDqpb7anhsf9uv_tKsl9lUlvaeP6NkpjT3EUijMbAwLIPNBM5iTPFWzumcR1V4FvcKaDyxTIYdIB9IpVTr8MEB7dICX0JHo7hmczr7pDCsVxe7uoft9G8QkfxN3qfIzh0q1BL0OndtwScmY0QU6NvBsH8iqI55H-zuT9u7d8PVTnKc2_KNHt2SZ5g", description="India's most exclusive address — palatial villa on the golf course."),
            Property(id=5, name="Godrej Gold County", developer="Godrej Properties", location="Tumkur Road, Bangalore", type="Plot", bhk="N/A", price_min=8500000, price_max=12000000, carpet_area=8000, rera_number="KA-RE-2024-005", rera_verified=True, status="available", construction_status="ready", image_url="https://lh3.googleusercontent.com/aida-public/AB6AXuAiY7qmyoy2MeI8WRR7EwZciq5KZvIIghE5FCt4Ei_A5I4q-NG4pSdwDrju9lWYyAj1BlLaHbZNdJSlCcHUyfvJvMIPy1xKwKLQ4OREc8iE_Vpi4znZd7ghjvevMqXsDfnp_2--fszEixb4ZhKO8oeNEM82j5JjChwle5HhDxNXuPgdIIm3CAyArUhsLuxDKuiKFYesZPzxpxNq2Okml-cCAOZfqNSIRuuqDEbAMPh7SYmf1QzbC3ukzXpZN4YUualev44rIImJzD0", description="Premium plotted development in a gated township."),
            Property(id=6, name="Hiranandani Atlantis", developer="Hiranandani", location="Powai, Mumbai", type="Apartment", bhk="1 & 2 BHK", price_min=9000000, price_max=15000000, carpet_area=1200, rera_number="MH-RE-2024-006", rera_verified=True, status="available", construction_status="under_construction", image_url="https://lh3.googleusercontent.com/aida-public/AB6AXuDyunNyoml7NRFpYRHcPo9EvhKoKh0zmFSwy0UHLImZdHUHnRUsFY4admTAS5LkhUJ_2YzqnqEUQ2Tn0Ia038oCcqPkECRlVisHTTLumVJKdS8AyhN6nBk7HS58iiFbgCU8ZSHtwmt68sbyt_IWlfEkk4D6tuLuOtu2tMcZ1snp59C_Uu1hnqsS3I8eEBaWl_GIXyUP8xgnvZp0KPPhJ7hX9J6eR3xpu7bLeyql2PtCDLjmC2-ObRPOrwWz0eScpgb22x0hMZNZq3c", description="Lake-facing smart homes in Mumbai's knowledge hub."),
            Property(id=7, name="Oberoi Sky City", developer="Oberoi Realty", location="Borivali East, Mumbai", type="Penthouse", bhk="5 BHK", price_min=125000000, price_max=125000000, carpet_area=6400, rera_number="MH-RE-2024-007", rera_verified=True, status="available", construction_status="ready", image_url="https://lh3.googleusercontent.com/aida-public/AB6AXuDvcL0YBWIS-VUuQ9X_RCpQp5cFWnIDPma2bFRbxXDTBwUX1fQdVKO8h4xA0siB9fXYR7yjt-1P24QRjzCvRIeIj-AmaYZVjyPkAvanWHXN1oL53jLa86tSG1zlJJaLyD1i9xgzDR5Qrri-KcXkG9hkhjNjCAY0u5FLiqloXH26jouAivyNB8F9JltPLGqjT3MeQhUhDUfkotlj1u_bFcYMFrVLizU-LdbSqNCNL2cU7gTi8t7FpSJyoU7a0SVNSm6BacIWgUTMbiY", description="Ultra-premium penthouse with 360° Sanjay Gandhi National Park views."),
            Property(id=8, name="Tata Primanti", developer="Tata Housing", location="Sector 72, Gurgaon", type="Villa", bhk="4 BHK", price_min=82000000, price_max=82000000, carpet_area=5500, rera_number="HR-RE-2024-008", rera_verified=True, status="available", construction_status="ready", image_url="https://lh3.googleusercontent.com/aida-public/AB6AXuDS7qMcWQP_WKRruqUIhqhzaHkE2P8kOJaVj2KqyC00YoPk2vTz-Z7zu0_9FwXEPxhADJnVK_0YojlCzIKL8VpwrkrdI2he9Pxify7neo9lpE5H0bFPiPuMoXxscWx1K-DyAusP0BPw9TFEE0IzdlRSa9pcczQbsgmuYhKsszV5mKwsgZKIbegQUt59P_JawWaNH-r9AnV3QtU-TmHigqcRHHZrYgUAuVN5F-uf_M_BleTkLmjyZvHUBEq5E9CvZ-N-3oA8sld8CH0", description="Modern estate with infinity pool and private cinema room."),
            Property(id=9, name="Lodha World One", developer="Lodha Group", location="Lower Parel, Mumbai", type="Penthouse", bhk="4 BHK", price_min=90000000, price_max=110000000, carpet_area=5000, rera_number="MH-RE-2024-009", rera_verified=True, status="reserved", construction_status="ready", image_url="", description="Rooftop penthouse in India's tallest residential tower."),
            Property(id=10, name="The Glass House", developer="Brigade Group", location="Lavelle Road, Bangalore", type="Villa", bhk="5 BHK", price_min=145000000, price_max=145000000, carpet_area=8500, rera_number="KA-RE-2024-010", rera_verified=True, status="available", construction_status="ready", image_url="https://lh3.googleusercontent.com/aida-public/AB6AXuC7dPbWFRLKNmTUMjOzIpx82GylyvZ6h9NPdkf5ipiSgESBGTPzV8XLz0UEe4oyrsN6cZm5dBQC8ACDhf1PbGPeLLJ4ZFkQR_lysXO1GWdPBCOx8tG1LM5vwOCuedIULCai7EfezCPgq0vqi-t-HNBSlrE3jqRdVckDaYhvwBjmjgGkmMqczP_Xs5SZxPaQMLeub5QXkQXcf6FBRyR_0i0hiqvoJf5Ms3WBQmI7u2VKq-4vNKfwLjQTmKWP1feq4kyPH2Kj96MhWVI", description="Architectural masterpiece on Bangalore's most coveted boulevard."),
            Property(id=11, name="Raheja Vivarea", developer="K Raheja Corp", location="Mahalaxmi, Mumbai", type="Apartment", bhk="3 & 4 BHK", price_min=42000000, price_max=48000000, carpet_area=3200, rera_number="MH-RE-2024-011", rera_verified=True, status="available", construction_status="ready", image_url="", description="Premium residences overlooking Mumbai's iconic racecourse."),
            Property(id=12, name="The Oak Residence", developer="DLF", location="Golf Links, Delhi", type="Villa", bhk="4 BHK", price_min=6500000, price_max=7500000, carpet_area=4800, rera_number="DL-RE-2024-012", rera_verified=True, status="available", construction_status="ready", image_url="", description="Heritage-inspired villa with modern amenities."),
            Property(id=13, name="Cinema House", developer="Prestige", location="Whitefield, Bangalore", type="Villa", bhk="5 BHK", price_min=3500000, price_max=4000000, carpet_area=5200, rera_number="KA-RE-2024-013", rera_verified=True, status="available", construction_status="ready", image_url="", description="Designer villa with private cinema and infinity pool."),
            Property(id=14, name="Palais Royale", developer="Indiabulls", location="Worli, Mumbai", type="Penthouse", bhk="6+ BHK", price_min=125000000, price_max=125000000, carpet_area=8000, rera_number="MH-RE-2024-014", rera_verified=True, status="reserved", construction_status="ready", image_url="", description="Ultra-luxury penthouse in Mumbai's most iconic tower."),
            Property(id=15, name="Oberoi Realty Worli", developer="Oberoi Realty", location="Worli, Mumbai", type="Villa", bhk="5 BHK", price_min=44500000, price_max=44500000, carpet_area=4200, rera_number="MH-RE-2024-015", rera_verified=True, status="available", construction_status="ready", image_url="https://lh3.googleusercontent.com/aida-public/AB6AXuD1LkMtmNwf8juYL0nJkU1T2sLrH_9PomigHNWhutujKqk8JGuDc1973zxHvCHPpP8Zk9xtvvpSpUrLXN67cf6Tcp61TOYdYv-DNwWCXvvwNPLR-0lLvkmOCLKtgq5JMb4T5XJUsFCvm6rpFI2iWSTooH64dS9SCS3uYjK64u_2U8Njc_s7xrmFisowN-I9i8fKAyuOukrW-7uByeB3C-NT10rZ_hXsvkRr-VRGjjhWoJd8RP0-kHf91udo_biZ3Xicf5E312NeFqA", description="Subject property for active negotiation — premium Worli sea-face."),
        ]
        session.add_all(props)

        # ── Deals (24) across 8 pipeline stages ──
        stages = [
            ("lead_capture", 15), ("lead_capture", 10), ("lead_capture", 15), ("lead_capture", 10),
            ("qualification", 35), ("qualification", 30),
            ("site_visit", 50), ("site_visit", 45), ("site_visit", 50),
            ("negotiation", 65), ("negotiation", 60),
            ("agreement", 80), ("agreement", 75),
            ("documentation", 85), ("documentation", 90),
            ("registration", 92), ("registration", 95),
            ("possession", 100), ("possession", 100),
            ("lead_capture", 12), ("qualification", 25),
            ("site_visit", 55), ("negotiation", 70), ("agreement", 82),
        ]
        deal_values = [
            450000, 750000, 320000, 280000,
            2200000, 1600000,
            1800000, 3200000, 1500000,
            4200000, 3800000,
            5600000, 2500000,
            6200000, 1800000,
            7500000, 3200000,
            12500000, 8200000,
            180000, 900000,
            2100000, 1400000, 3600000,
        ]
        deal_names = [
            "Alexander Thorne", "Seraphina Vane", "Li Ming", "Prateek Shah",
            "Julian Blackwood", "Nina Petrova",
            "Elena Rossi-Client", "Chen Wei", "Omar Hassan",
            "Marcus Sterling", "Raj Malhotra",
            "Victoria Hamilton", "Sophie Laurent",
            "James Morrison", "Akiko Tanaka",
            "Roberto Silva", "Anna Kowalski",
            "The Royal Plaza", "Victoria Hamilton Estate",
            "New Lead A", "New Lead B",
            "Site Lead C", "Nego Lead D", "Agreement Lead E",
        ]
        deals = []
        for i, ((stage, prob), val) in enumerate(zip(stages, deal_values)):
            deals.append(Deal(
                id=i+1, lead_id=min(i+1, 20), property_id=min(i+1, 15) if i < 15 else None,
                stage=stage, value=val, probability=prob,
                expected_close=now + timedelta(days=10 + i * 5),
                assigned_to=(i % 8) + 1,
                notes=f"Deal for {deal_names[i]}" if i < len(deal_names) else "",
            ))
        session.add_all(deals)

        # ── Site Visits (10) ──
        visits = [
            SiteVisit(id=1, lead_id=6, property_id=9, agent_id=5, scheduled_at=now.replace(hour=14, minute=0), status="confirmed", feedback=None),
            SiteVisit(id=2, lead_id=7, property_id=12, agent_id=4, scheduled_at=now.replace(hour=10, minute=30), status="completed", feedback="Client impressed with the oak paneling. Concerned about parking."),
            SiteVisit(id=3, lead_id=2, property_id=13, agent_id=5, scheduled_at=now + timedelta(days=1, hours=3), status="pending"),
            SiteVisit(id=4, lead_id=5, property_id=4, agent_id=5, scheduled_at=now + timedelta(days=2), status="confirmed"),
            SiteVisit(id=5, lead_id=15, property_id=7, agent_id=1, scheduled_at=now + timedelta(days=3), status="pending"),
            SiteVisit(id=6, lead_id=1, property_id=1, agent_id=1, scheduled_at=now - timedelta(days=2), status="completed", feedback="Loved the villa. Ready to negotiate.", rating=5),
            SiteVisit(id=7, lead_id=3, property_id=4, agent_id=5, scheduled_at=now - timedelta(days=5), status="completed", feedback="Too far from city center. Passed.", rating=2),
            SiteVisit(id=8, lead_id=18, property_id=3, agent_id=2, scheduled_at=now + timedelta(days=4), status="pending"),
            SiteVisit(id=9, lead_id=11, property_id=11, agent_id=2, scheduled_at=now + timedelta(days=1), status="confirmed"),
            SiteVisit(id=10, lead_id=12, property_id=6, agent_id=4, scheduled_at=now - timedelta(days=1), status="completed", feedback="Good location but needs renovation.", rating=3),
        ]
        session.add_all(visits)

        # ── Channel Partners (6) ──
        partners = [
            ChannelPartner(id=1, name="Elena Vance", company="Elysian Realty Group", phone="+1-555-1001", email="elena@elysian.com", tier="gold", total_leads=142, total_deals=45, total_commission=124000, conversion_rate=32, avatar_url="https://lh3.googleusercontent.com/aida-public/AB6AXuCrh7g3WXA-avGZpLmxTK5OYzJ1m0XGGK0oPspBX2AFlQKNzln-p8qsD7q3iJgJfd3kBIuIiHHcc0iRPZiI_3SVTZcInIce1-GcNj0iaDdvS3cjDKMM9iaCallJ6DeBMuU6MJjlbtwvTfkwbPM7H1nqwLxR49mB8XKNK4owjO5MNZ0bX2hKBjOk1-2aKQ1WO3xodFxzWektlnHbhd69KJVBq3eme4Kg0QOaF4AANOaafbW3OeT-3_HfRJSvKH4OrCKlSJomogeDXag"),
            ChannelPartner(id=2, name="Marcus Thorne", company="Skyline Estates", phone="+1-555-1002", email="marcus@skyline.com", tier="silver", total_leads=88, total_deals=18, total_commission=82000, conversion_rate=21, avatar_url=""),
            ChannelPartner(id=3, name="Sarah Chen", company="The Heritage Firm", phone="+1-555-1003", email="sarah@heritage.com", tier="bronze", total_leads=45, total_deals=5, total_commission=31500, conversion_rate=12, avatar_url=""),
            ChannelPartner(id=4, name="David Kim", company="Pacific Realty", phone="+1-555-1004", email="david@pacific.com", tier="gold", total_leads=120, total_deals=38, total_commission=156000, conversion_rate=28, avatar_url=""),
            ChannelPartner(id=5, name="Isabella Rossi", company="Roman Properties", phone="+39-555-1005", email="isabella@roman.com", tier="silver", total_leads=65, total_deals=12, total_commission=48000, conversion_rate=18, avatar_url=""),
            ChannelPartner(id=6, name="Ahmed Al-Rashid", company="Gulf Premium Realty", phone="+971-555-1006", email="ahmed@gulfpremium.com", tier="gold", total_leads=200, total_deals=60, total_commission=280000, conversion_rate=30, avatar_url=""),
        ]
        session.add_all(partners)

        # ── Commissions (8) ──
        commissions = [
            Commission(id=1, partner_id=1, ref_number="LF-9021", description="Penthouse Sale - Skyline", amount=4200, status="pending", created_at=now - timedelta(days=3)),
            Commission(id=2, partner_id=3, ref_number="LF-8842", description="Estate Closing - Heritage", amount=1850, status="pending", created_at=now - timedelta(days=7)),
            Commission(id=3, partner_id=1, ref_number="LF-8711", description="Duplex Referral - Elysian", amount=950, status="paid", paid_at=now - timedelta(days=14), created_at=now - timedelta(days=20)),
            Commission(id=4, partner_id=2, ref_number="LF-8650", description="Villa Sale - Skyline", amount=3200, status="paid", paid_at=now - timedelta(days=10), created_at=now - timedelta(days=15)),
            Commission(id=5, partner_id=4, ref_number="LF-8590", description="Luxury Apt - Pacific", amount=5600, status="pending", created_at=now - timedelta(days=5)),
            Commission(id=6, partner_id=6, ref_number="LF-8520", description="Worli Sea-Face Villa", amount=8400, status="paid", paid_at=now - timedelta(days=2), created_at=now - timedelta(days=8)),
            Commission(id=7, partner_id=5, ref_number="LF-8480", description="Rome Penthouse - Roman", amount=2100, status="pending", created_at=now - timedelta(days=4)),
            Commission(id=8, partner_id=1, ref_number="LF-8410", description="Beachfront Condo - Elysian", amount=1800, status="paid", paid_at=now - timedelta(days=20), created_at=now - timedelta(days=30)),
        ]
        session.add_all(commissions)

        # ── Bank Rates (5) ──
        banks = [
            BankRate(id=1, name="State Bank of India", code="SBI", floating_rate_min=8.40, floating_rate_max=9.15, max_tenure=30, processing_fee="0.35% Min", category="Preferred", color="blue"),
            BankRate(id=2, name="HDFC Bank", code="HDFC", floating_rate_min=8.50, floating_rate_max=9.40, max_tenure=30, processing_fee="Up to $500", category="Premium", color="red"),
            BankRate(id=3, name="ICICI Bank", code="ICICI", floating_rate_min=8.75, floating_rate_max=9.60, max_tenure=25, processing_fee="0.50% Flat", category="Express", color="orange"),
            BankRate(id=4, name="Axis Bank", code="AXIS", floating_rate_min=8.55, floating_rate_max=9.30, max_tenure=30, processing_fee="Up to $450", category="Standard", color="purple"),
            BankRate(id=5, name="Kotak Mahindra", code="KOTAK", floating_rate_min=8.65, floating_rate_max=9.50, max_tenure=25, processing_fee="0.40% Flat", category="Digital", color="teal"),
        ]
        session.add_all(banks)

        # ── Negotiation Chat (1 demo) ──
        demo_messages = json.dumps([
            {"role": "assistant", "content": "I've analyzed the latest counter-offer from the buyer ($4.2M). They are currently 4% below the adjusted market comps for Belvedere Heights. However, their contingency period is exceptionally short.", "timestamp": (now - timedelta(hours=2)).isoformat()},
            {"role": "assistant", "content": "Would you like me to draft a response focusing on the valuation gap or should we prioritize the closing speed as a leverage point?", "timestamp": (now - timedelta(hours=2)).isoformat()},
        ])
        session.add(NegotiationChat(id=1, deal_id=10, messages=demo_messages))

        await session.commit()
        print("Database seeded with demo data.")
