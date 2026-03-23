import os
import uuid
from dotenv import load_dotenv

import ldclient
from ldclient import Context
from ldclient.config import Config
from flask import Flask, render_template

load_dotenv()

app = Flask(__name__)

# Initialize LaunchDarkly
sdk_key = os.environ.get("LAUNCHDARKLY_SDK_KEY")
if not sdk_key:
    raise RuntimeError("Set LAUNCHDARKLY_SDK_KEY environment variable")

config = Config(sdk_key)
ldclient.set_config(config)
ld_client = ldclient.get()

if ld_client.is_initialized():
    print("[LD] LaunchDarkly client initialized successfully.")
else:
    print("[LD] WARNING: LaunchDarkly client failed to initialize. Flags will use defaults.")


def evaluate_flags():
    """Evaluate all feature flags and build scene + test data."""
    # Stable context for most flags
    stable_context = Context.builder("elizabeth-bennet").kind("user").name("Elizabeth Bennet").build()

    # Random context for the flaky invitation — fresh coin flip each request
    flaky_context = Context.builder(str(uuid.uuid4())).kind("user").name("Random Guest").build()

    # --- Flag evaluations ---
    letter_delivered = ld_client.variation("luv-letter-delivery", stable_context, False)
    proposal_elegant = ld_client.variation("luv-proposal-style", stable_context, False)
    invitation_arrived = ld_client.variation("luv-ball-invitation", flaky_context, False)
    staging_chaos = ld_client.variation("luv-staging-chaos", stable_context, False)

    # --- Chapter I: The Letter ---
    if letter_delivered:
        letter = {
            "title": "Chapter I: The Letter That Arrived",
            "scene": "Darcy's letter arrives at Longbourn. Elizabeth reads it by candlelight, and for the first time, understands his true character. The words are careful, honest, and devastating in their sincerity.",
            "quote": "\"I have been a selfish being all my life, in practice, though not in principle.\"",
            "test_status": "PASSED",
            "test_name": "test_letter_delivery",
            "test_detail": "assert letter.delivered == True  # \u2714 Letter received",
            "flag_state": True,
        }
    else:
        letter = {
            "title": "Chapter I: The Letter That Never Arrived",
            "scene": "The letter was never delivered. No one wrote a test for the postal service. The flag has no coverage, so the feature silently fails. Elizabeth never learns the truth.",
            "quote": "\"It is a truth universally acknowledged that a feature in possession of no test coverage must be in want of a bug.\"",
            "test_status": "SKIPPED",
            "test_name": "test_letter_delivery",
            "test_detail": "SKIPPED: no test exists for letter delivery \u2014 nobody wrote this test",
            "flag_state": False,
        }

    # --- Chapter II: The Proposal ---
    if proposal_elegant:
        proposal = {
            "title": "Chapter II: The Proposal That Passed Code Review",
            "scene": "At Pemberley, Darcy approaches Elizabeth with humility. His second proposal is elegant, refactored, and well-tested. The senior engineer approves with no comments.",
            "quote": "\"You are too generous to trifle with me. If your feelings are still what they were last April, tell me so at once.\"",
            "test_status": "PASSED",
            "test_name": "test_proposal_response",
            "test_detail": "assert proposal.response == 'accepted'  # \u2714 Proposal accepted",
            "flag_state": True,
        }
    else:
        proposal = {
            "title": "Chapter II: The Proposal That Failed Code Review",
            "scene": "At Hunsford, Darcy delivers his first proposal. It is arrogant, untested, and riddled with insults to Elizabeth's family. The senior engineer (Elizabeth) left 47 comments, all requesting changes.",
            "quote": "\"In vain I have struggled. It will not do. My feelings will not be repressed. You must allow me to tell you how ardently I admire and love you.\"",
            "test_status": "FAILED",
            "test_name": "test_proposal_response",
            "test_detail": "AssertionError: expected 'accepted' but got 'you are the last man in the world'",
            "flag_state": False,
        }

    # --- Chapter III: The Flaky Invitation ---
    if invitation_arrived:
        invitation = {
            "title": "Chapter III: The Invitation That Arrived",
            "scene": "The footman delivers the invitation to the Netherfield Ball. The Bennet household erupts in excitement. Mrs. Bennet's nerves are, for once, justified.",
            "quote": "\"My dear Mr. Bennet, have you heard that Netherfield Park is let at last?\"",
            "test_status": "PASSED",
            "test_name": "test_ball_invitation",
            "test_detail": "assert invitation.delivered == True  # \u2714 ...this time",
            "flag_state": True,
        }
    else:
        invitation = {
            "title": "Chapter III: The Invitation That Got Lost",
            "scene": "The footman stopped at the pub. The invitation never arrived. The Bennets sit at home in uncomfortable silence. Mrs. Bennet blames Mr. Bennet, who is reading.",
            "quote": "\"The invitation microservice has a race condition. Sometimes the footman delivers it, sometimes he stops at the pub.\"",
            "test_status": "FAILED",
            "test_name": "test_ball_invitation",
            "test_detail": "AssertionError: expected invitation.delivered but got False  # flaky \u26a0\ufe0f",
            "flag_state": False,
        }
    invitation["is_flaky"] = True

    # --- Chapter IV: Staging Chaos ---
    if staging_chaos:
        staging = {
            "title": "Chapter IV: The Staging Environment Ball",
            "scene": "The staging environment has drifted catastrophically from production. Mr. Collins has married Mr. Darcy. The Ball is running in a Kubernetes pod no one can find. Elizabeth has received 47 letters addressed to test_user_42. Wickham is somehow a colonel. Lady Catherine is returning 503 errors.",
            "quote": "\"SELECT * FROM marriages WHERE groom = 'mr_collins' AND bride = 'mr_darcy' \u2014 1 row returned\"",
            "test_status": "FAILED",
            "test_name": "test_staging_environment",
            "test_detail": "FAILED: staging has drifted \u2014 prod says Elizabeth/Darcy, staging says Collins/Darcy",
            "flag_state": True,
            "chaos_details": [
                "Mr. Collins married Mr. Darcy (data migration error)",
                "Ball venue: kubernetes-pod-7f8b9c \u2014 node not found",
                "Elizabeth received 47 letters for test_user_42",
                "Wickham promoted to Colonel (role escalation bug)",
                "Lady Catherine de Bourgh returning 503 Service Unavailable",
                "Pemberley DNS resolving to Longbourn",
            ],
        }
    else:
        staging = {
            "title": "Chapter IV: The Staging Environment",
            "scene": "The staging environment is currently at peace. All services are responding. The data is consistent. This will not last.",
            "quote": "\"A lady's imagination is very rapid; it jumps from admiration to love, from love to matrimony, from matrimony to staging drift, in a moment.\"",
            "test_status": "PASSED",
            "test_name": "test_staging_environment",
            "test_detail": "assert staging.matches(production)  # \u2714 ...for now",
            "flag_state": False,
            "chaos_details": [],
        }

    # --- Build test summary ---
    scenes = [letter, proposal, invitation, staging]
    tests = []
    for s in scenes:
        tests.append({
            "name": s["test_name"],
            "status": s["test_status"],
            "detail": s["test_detail"],
            "is_flaky": s.get("is_flaky", False),
        })

    passed = sum(1 for t in tests if t["status"] == "PASSED")
    failed = sum(1 for t in tests if t["status"] == "FAILED")
    skipped = sum(1 for t in tests if t["status"] == "SKIPPED")
    flaky = sum(1 for t in tests if t["is_flaky"])

    summary = f"{passed} passed, {failed} failed, {skipped} skipped, {flaky} flaky"

    return {
        "letter": letter,
        "proposal": proposal,
        "invitation": invitation,
        "staging": staging,
        "tests": tests,
        "summary": summary,
    }


@app.route("/")
def index():
    data = evaluate_flags()
    return render_template("index.html", **data)


if __name__ == "__main__":
    app.run(debug=True)
