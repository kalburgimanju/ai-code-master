"""Tests for loading and processing test data."""

import json
from pathlib import Path


def test_load_test_data():
    """Test that test_data.json can be loaded correctly."""
    test_data_path = Path("test_data.json")
    assert test_data_path.exists()

    with open(test_data_path, "r") as f:
        data = json.load(f)

    # Verify it's a list
    assert isinstance(data, list)

    # Verify it has data
    assert len(data) > 0

    # Verify structure of first item
    first_item = data[0]
    assert "jobTitle" in first_item
    assert "companyName" in first_item
    assert "location" in first_item
    assert "jobUrl" in first_item
    assert "salaryMin" in first_item
    assert "salaryMax" in first_item
    assert "applicants" in first_item

    # Verify salary range
    assert first_item["salaryMin"] > 0
    assert first_item["salaryMax"] > first_item["salaryMin"]

    # Verify applicant count
    assert isinstance(first_item["applicants"], int)
    assert first_item["applicants"] >= 0


def test_test_data_content():
    """Test that test_data.json contains expected AI automation related content."""
    test_data_path = Path("test_data.json")

    with open(test_data_path, "r") as f:
        data = json.load(f)

    # Check for AI automation skills in descriptions
    automation_keywords = ["AI", "automation", "n8n", "Make", "Zapier", "Claude", "OpenAI", "LLM"]

    found_ai_content = False
    for job in data:
        description = job.get("descriptionText", "").lower()
        for keyword in automation_keywords:
            if keyword.lower() in description:
                found_ai_content = True
                break

    assert found_ai_content, "Test data should contain AI automation related content"


def test_test_data_remote_jobs():
    """Test that test_data.json has remote jobs."""
    test_data_path = Path("test_data.json")

    with open(test_data_path, "r") as f:
        data = json.load(f)

    # At least one job should be remote (based on test data)
    remote_jobs = [job for job in data if job.get("isRemote", False)]
    assert len(remote_jobs) > 0, "Test data should have remote jobs"


def test_data_processing_integration():
    """Integration test: verify the complete data flow from loading to processing."""
    from scraper.models import Job, Salary
    from scraper.storage import save_job, load_all_jobs, export_to_json
    from tempfile import TemporaryDirectory
    import os

    with TemporaryDirectory() as temp_dir:
        # Load test data
        test_data_path = Path("test_data.json")
        with open(test_data_path, "r") as f:
            raw_data = json.load(f)

        # Convert to Job objects
        jobs = []
        for job_data in raw_data:
            salary = Salary(
                min_amount=job_data["salaryMin"],
                max_amount=job_data["salaryMax"],
                currency="USD"
            )

            job = Job(
                id=job_data.get("jobUrl", f"job_{len(jobs)}"),
                title=job_data["jobTitle"],
                company=job_data["companyName"],
                location=job_data["location"],
                url=job_data["jobUrl"],
                description=job_data.get("descriptionText", ""),
                salary=salary,
                applicant_count=job_data["applicants"],
                is_remote=job_data.get("isRemote", False),
                is_contractor_friendly=job_data.get("employmentType") == "full_time",
                skills=["AI", "automation"]  # Simplified for testing
            )
            jobs.append(job)

        # Save jobs
        data_dir = Path(temp_dir)
        for job in jobs:
            save_job(job, data_dir)

        # Load all jobs
        loaded_jobs = load_all_jobs(data_dir)
        assert len(loaded_jobs) == len(jobs)

        # Export to JSON
        output_file = data_dir / "test_export.json"
        export_to_json(loaded_jobs, str(output_file))

        # Verify export was created
        assert output_file.exists()

        # Load exported data
        with open(output_file, "r") as f:
            exported_data = json.load(f)

        assert isinstance(exported_data, list)
        assert len(exported_data) == len(jobs)

        # Verify all jobs are present in export
        exported_titles = [job["title"] for job in exported_data]
        for job in jobs:
            assert job.title in exported_titles


if __name__ == "__main__":
    import pytest
    pytest.main([__file__, "-v"])