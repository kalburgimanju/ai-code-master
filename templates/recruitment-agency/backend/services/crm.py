"""CRM Service for HubSpot integration."""

import httpx
from datetime import datetime
from typing import Any, Optional

from backend.config import get_settings
from backend.storage.models import PipelineDeal, Company, Contact


class CRMClient:
    """Client for HubSpot CRM API."""

    def __init__(self):
        self.settings = get_settings()
        self.api_key = self.settings.apis.hubspot.api_key
        self.portal_id = self.settings.apis.hubspot.portal_id
        self.base_url = self.settings.apis.hubspot.base_url
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        } if self.api_key else {}

    # Company operations
    async def create_company(self, company: Company) -> Optional[str]:
        """Create a company in HubSpot."""
        if not self.api_key or self.settings.features.dry_run_mode:
            return f"mock_company_{company.id}"

        url = f"{self.base_url}/crm/v3/objects/companies"
        properties = {
            "name": company.name,
            "domain": company.domain,
            "industry": company.industry,
            "numberofemployees": str(company.employee_count) if company.employee_count else "",
            "city": company.headquarters.split(",")[0].strip() if company.headquarters else "",
            "state": "",
            "country": company.headquarters.split(",")[-1].strip() if company.headquarters and "," in company.headquarters else "",
            "phone": "",
            "website": f"https://{company.domain}" if company.domain else "",
            "description": company.description or "",
            "lifecyclestage": "lead",
            "hs_lead_status": "NEW",
            "recruitment_local_id": company.id,
        }

        # Add custom properties
        custom_props = self.settings.apis.hubspot.custom_properties
        for prop in custom_props:
            if prop == "recruitment_agent_source":
                properties[prop] = company.source
            elif prop == "recruitment_research_summary":
                properties[prop] = f"Tech: {', '.join(company.tech_stack[:5])}. Hiring: {', '.join(company.hiring_needs[:3])}"

        data = {"properties": properties}

        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=self.headers, json=data)
            response.raise_for_status()
            result = response.json()
            return result.get("id")

    async def update_company(self, company_id: str, company: Company) -> bool:
        """Update a company in HubSpot."""
        if not self.api_key:
            return True

        url = f"{self.base_url}/crm/v3/objects/companies/{company_id}"
        properties = {
            "name": company.name,
            "domain": company.domain,
            "industry": company.industry,
            "numberofemployees": str(company.employee_count) if company.employee_count else "",
            "city": company.headquarters.split(",")[0].strip() if company.headquarters else "",
            "website": f"https://{company.domain}" if company.domain else "",
            "description": company.description or "",
        }

        data = {"properties": properties}

        async with httpx.AsyncClient() as client:
            response = await client.patch(url, headers=self.headers, json=data)
            return response.status_code == 200

    # Contact operations
    async def create_contact(self, contact: Contact, company_id: Optional[str] = None) -> Optional[str]:
        """Create a contact in HubSpot."""
        if not self.api_key or self.settings.features.dry_run_mode:
            return f"mock_contact_{contact.id}"

        url = f"{self.base_url}/crm/v3/objects/contacts"
        properties = {
            "email": contact.email,
            "firstname": contact.first_name,
            "lastname": contact.last_name,
            "jobtitle": contact.title,
            "linkedin_url": contact.linkedin_url,
            "phone": contact.phone,
            "lifecyclestage": "lead",
            "hs_lead_status": "NEW",
            "recruitment_local_id": contact.id,
        }

        data = {"properties": properties}

        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=self.headers, json=data)
            response.raise_for_status()
            result = response.json()
            hubspot_contact_id = result.get("id")

            # Associate with company if provided
            if company_id and hubspot_contact_id:
                await self._associate_contact_company(hubspot_contact_id, company_id, client)

            return hubspot_contact_id

    async def update_contact(self, contact_id: str, contact: Contact) -> bool:
        """Update a contact in HubSpot."""
        if not self.api_key:
            return True

        url = f"{self.base_url}/crm/v3/objects/contacts/{contact_id}"
        properties = {
            "email": contact.email,
            "firstname": contact.first_name,
            "lastname": contact.last_name,
            "jobtitle": contact.title,
            "linkedin_url": contact.linkedin_url,
            "phone": contact.phone or "",
        }

        data = {"properties": properties}

        async with httpx.AsyncClient() as client:
            response = await client.patch(url, headers=self.headers, json=data)
            return response.status_code == 200

    async def _associate_contact_company(
        self,
        contact_id: str,
        company_id: str,
        client: httpx.AsyncClient,
    ) -> bool:
        """Associate contact with company in HubSpot."""
        url = f"{self.base_url}/crm/v4/objects/contacts/{contact_id}/associations/companies/{company_id}"
        data = [{"associationCategory": "HUBSPOT_DEFINED", "associationTypeId": 1}]  # contact_to_company
        response = await client.put(url, headers=self.headers, json=data)
        return response.status_code == 200

    # Deal operations
    async def create_deal(self, deal: PipelineDeal) -> Optional[str]:
        """Create a deal in HubSpot."""
        if not self.api_key or self.settings.features.dry_run_mode:
            return f"mock_deal_{deal.id}"

        url = f"{self.base_url}/crm/v3/objects/deals"

        # Map our stages to HubSpot deal stages
        stage_map = {
            "discovered": "appointmentscheduled",
            "researched": "qualifiedtobuy",
            "contacted": "presentationscheduled",
            "replied": "decisionmakerboughtin",
            "call_booked": "contractsent",
            "qualified": "contractsent",
            "proposal_sent": "contractsent",
            "closed_won": "closedwon",
            "closed_lost": "closedlost",
        }

        hubspot_stage = stage_map.get(deal.stage.value, "appointmentscheduled")

        properties = {
            "dealname": deal.name,
            "amount": str(deal.value_usd or 0),
            "dealstage": hubspot_stage,
            "pipeline": "default",
            "closedate": deal.expected_close_date.strftime("%Y-%m-%d") if deal.expected_close_date else "",
            "description": deal.description or "",
            "recruitment_agent_source": deal.source,
            "recruitment_agent_name": deal.source_agent_id or "",
            "recruitment_local_id": deal.id,
        }

        data = {"properties": properties}

        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=self.headers, json=data)
            response.raise_for_status()
            result = response.json()
            hubspot_deal_id = result.get("id")

            # Associate with company
            if deal.company_id:
                hubspot_company_id = await self._get_hubspot_company_id(deal.company_id, client)
                if hubspot_company_id:
                    await self._associate_deal_company(hubspot_deal_id, hubspot_company_id, client)

            # Associate with contact
            if deal.contact_id:
                hubspot_contact_id = await self._get_hubspot_contact_id(deal.contact_id, client)
                if hubspot_contact_id:
                    await self._associate_deal_contact(hubspot_deal_id, hubspot_contact_id, client)

            return hubspot_deal_id

    async def _get_hubspot_company_id(self, local_company_id: str, client: httpx.AsyncClient) -> Optional[str]:
        """Get HubSpot company ID by local ID (stored in custom property)."""
        url = f"{self.base_url}/crm/v3/objects/companies/search"
        data = {
            "filterGroups": [{
                "filters": [{
                    "propertyName": "recruitment_local_id",
                    "operator": "EQ",
                    "value": local_company_id,
                }]
            }],
            "properties": ["id"],
            "limit": 1,
        }
        response = await client.post(url, headers=self.headers, json=data)
        if response.status_code == 200:
            results = response.json().get("results", [])
            if results:
                return results[0].get("id")
        return None

    async def _get_hubspot_contact_id(self, local_contact_id: str, client: httpx.AsyncClient) -> Optional[str]:
        """Get HubSpot contact ID by local ID."""
        url = f"{self.base_url}/crm/v3/objects/contacts/search"
        data = {
            "filterGroups": [{
                "filters": [{
                    "propertyName": "recruitment_local_id",
                    "operator": "EQ",
                    "value": local_contact_id,
                }]
            }],
            "properties": ["id"],
            "limit": 1,
        }
        response = await client.post(url, headers=self.headers, json=data)
        if response.status_code == 200:
            results = response.json().get("results", [])
            if results:
                return results[0].get("id")
        return None

    async def _associate_deal_company(
        self,
        deal_id: str,
        company_id: str,
        client: httpx.AsyncClient,
    ) -> bool:
        """Associate deal with company."""
        url = f"{self.base_url}/crm/v4/objects/deals/{deal_id}/associations/companies/{company_id}"
        data = [{"associationCategory": "HUBSPOT_DEFINED", "associationTypeId": 3}]  # deal_to_company
        response = await client.put(url, headers=self.headers, json=data)
        return response.status_code == 200

    async def _associate_deal_contact(
        self,
        deal_id: str,
        contact_id: str,
        client: httpx.AsyncClient,
    ) -> bool:
        """Associate deal with contact."""
        url = f"{self.base_url}/crm/v4/objects/deals/{deal_id}/associations/contacts/{contact_id}"
        data = [{"associationCategory": "HUBSPOT_DEFINED", "associationTypeId": 4}]  # deal_to_contact
        response = await client.put(url, headers=self.headers, json=data)
        return response.status_code == 200

    async def update_deal(self, deal: PipelineDeal) -> bool:
        """Update a deal in HubSpot."""
        if not self.api_key or not deal.crm_deal_id:
            return False

        url = f"{self.base_url}/crm/v3/objects/deals/{deal.crm_deal_id}"

        stage_map = {
            "discovered": "appointmentscheduled",
            "researched": "qualifiedtobuy",
            "contacted": "presentationscheduled",
            "replied": "decisionmakerboughtin",
            "call_booked": "contractsent",
            "qualified": "contractsent",
            "proposal_sent": "contractsent",
            "closed_won": "closedwon",
            "closed_lost": "closedlost",
        }

        hubspot_stage = stage_map.get(deal.stage.value, "appointmentscheduled")

        properties = {
            "dealname": deal.name,
            "amount": str(deal.value_usd or 0),
            "dealstage": hubspot_stage,
            "pipeline": "default",
            "closedate": deal.expected_close_date.strftime("%Y-%m-%d") if deal.expected_close_date else "",
            "description": deal.description or "",
        }

        data = {"properties": properties}

        async with httpx.AsyncClient() as client:
            response = await client.patch(url, headers=self.headers, json=data)
            return response.status_code == 200

    async def get_deal(self, deal_id: str) -> Optional[dict]:
        """Get a deal from HubSpot."""
        if not self.api_key:
            return None

        url = f"{self.base_url}/crm/v3/objects/deals/{deal_id}"
        params = {"properties": "dealname,amount,dealstage,closedate,description"}

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers, params=params)
            if response.status_code == 200:
                return response.json()
            return None

    async def search_deals(self, query: str) -> list[dict]:
        """Search deals in HubSpot."""
        if not self.api_key:
            return []

        url = f"{self.base_url}/crm/v3/objects/deals/search"
        data = {
            "filterGroups": [{
                "filters": [{
                    "propertyName": "dealname",
                    "operator": "CONTAINS_TOKEN",
                    "value": query,
                }]
            }],
            "properties": ["dealname", "amount", "dealstage", "closedate"],
            "limit": 10,
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=self.headers, json=data)
            if response.status_code == 200:
                return response.json().get("results", [])
            return []

    # Batch sync
    async def sync_all(
        self,
        companies: list[Company],
        contacts: list[Contact],
        deals: list[PipelineDeal],
    ) -> dict:
        """Sync all entities to HubSpot."""
        results = {
            "companies": {"created": 0, "updated": 0, "errors": []},
            "contacts": {"created": 0, "updated": 0, "errors": []},
            "deals": {"created": 0, "updated": 0, "errors": []},
        }

        # Sync companies first (for associations)
        for company in companies:
            try:
                if company.crm_company_id:
                    success = await self.update_company(company.crm_company_id, company)
                    if success:
                        results["companies"]["updated"] += 1
                else:
                    hubspot_id = await self.create_company(company)
                    if hubspot_id:
                        company.crm_company_id = hubspot_id
                        company.crm_synced_at = datetime.utcnow()
                        results["companies"]["created"] += 1
            except Exception as e:
                results["companies"]["errors"].append(f"{company.name}: {str(e)}")

        # Sync contacts
        for contact in contacts:
            try:
                if contact.crm_contact_id:
                    success = await self.update_contact(contact.crm_contact_id, contact)
                    if success:
                        contact.crm_synced_at = datetime.utcnow()
                        results["contacts"]["updated"] += 1
                else:
                    hubspot_id = await self.create_contact(contact, contact.company.crm_company_id if contact.company else None)
                    if hubspot_id:
                        contact.crm_contact_id = hubspot_id
                        contact.crm_synced_at = datetime.utcnow()
                        results["contacts"]["created"] += 1
            except Exception as e:
                results["contacts"]["errors"].append(f"{contact.full_name}: {str(e)}")

        # Sync deals
        for deal in deals:
            try:
                if deal.crm_deal_id:
                    success = await self.update_deal(deal)
                    if success:
                        deal.crm_synced_at = datetime.utcnow()
                        results["deals"]["updated"] += 1
                else:
                    hubspot_id = await self.create_deal(deal)
                    if hubspot_id:
                        deal.crm_deal_id = hubspot_id
                        deal.crm_synced_at = datetime.utcnow()
                        results["deals"]["created"] += 1
            except Exception as e:
                results["deals"]["errors"].append(f"{deal.name}: {str(e)}")

        return results