# ============================================================
#  YatraSathi — Global CSS  (call load_global_css() in every page)
# ============================================================
from __future__ import annotations

import streamlit as st


def load_global_css() -> None:
    """
    Inject the full YatraSathi design-system CSS into the current page.
    Call this ONCE near the top of every page file, right after
    st.set_page_config() (or just after imports in sub-pages).
    """
    st.markdown(
        """
        <style>
        /* ══════════════════════════════════════════
           0. HIDE DEFAULT STREAMLIT CHROME
        ══════════════════════════════════════════ */
        #MainMenu            { visibility: hidden; }
        footer               { visibility: hidden; }
        header               { visibility: hidden; }
        .stDeployButton      { display: none !important; }
        [data-testid="stToolbar"]  { display: none !important; }
        [data-testid="stDecoration"] { display: none !important; }

        /* ══════════════════════════════════════════
           1. GOOGLE FONT + GLOBAL TYPOGRAPHY
        ══════════════════════════════════════════ */
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');

        html, body, [class*="css"] {
            font-family: 'Poppins', sans-serif !important;
        }

        /* ══════════════════════════════════════════
           2. PAGE BACKGROUND
        ══════════════════════════════════════════ */
        .stApp {
            background: linear-gradient(180deg, #0E1117 0%, #1a1a2e 50%, #0E1117 100%);
        }

        /* Remove default top padding Streamlit adds */
        .block-container {
            padding-top: 1rem !important;
            padding-bottom: 2rem !important;
        }

        /* ══════════════════════════════════════════
           3. SIDEBAR
        ══════════════════════════════════════════ */
        [data-testid="stSidebar"] {
            background: linear-gradient(180deg, #0f0c29 0%, #302b63 60%, #24243e 100%) !important;
            border-right: 2px solid #FF4B4B;
        }
        [data-testid="stSidebar"] .stMarkdown,
        [data-testid="stSidebar"] label,
        [data-testid="stSidebar"] span {
            color: #e0e0e0 !important;
        }
        [data-testid="stSidebar"] a {
            color: #FF8E53 !important;
        }
        /* Nav-link active highlight */
        [data-testid="stSidebarNav"] a[aria-current="page"] {
            background: rgba(255,75,75,0.2) !important;
            border-right: 3px solid #FF4B4B;
            border-radius: 8px 0 0 8px;
        }

        /* ══════════════════════════════════════════
           4. TEXT INPUTS
        ══════════════════════════════════════════ */
        .stTextInput > div > div > input,
        .stTextArea  > div > div > textarea {
            background-color: #1e1e2e !important;
            color: #e0e0e0 !important;
            border: 1px solid #333 !important;
            border-radius: 10px !important;
            padding: 0.75rem 1rem !important;
            font-size: 1rem !important;
        }
        .stTextInput > div > div > input:focus,
        .stTextArea  > div > div > textarea:focus {
            border-color: #FF4B4B !important;
            box-shadow: 0 0 10px rgba(255,75,75,0.35) !important;
        }

        /* ══════════════════════════════════════════
           5. SELECT / MULTISELECT
        ══════════════════════════════════════════ */
        .stSelectbox > div > div,
        .stMultiSelect > div > div {
            background-color: #1e1e2e !important;
            border-radius: 10px !important;
            border: 1px solid #333 !important;
            color: #e0e0e0 !important;
        }

        /* ══════════════════════════════════════════
           6. SLIDER
        ══════════════════════════════════════════ */
        .stSlider [data-baseweb="slider"] div[role="slider"] {
            background: #FF4B4B !important;
        }

        /* ══════════════════════════════════════════
           7. BUTTONS
        ══════════════════════════════════════════ */
        .stButton > button {
            background: linear-gradient(135deg, #FF4B4B, #FF8E53) !important;
            color: white !important;
            border: none !important;
            border-radius: 25px !important;
            padding: 0.65rem 2.2rem !important;
            font-size: 1rem !important;
            font-weight: 600 !important;
            font-family: 'Poppins', sans-serif !important;
            transition: all 0.3s ease !important;
            box-shadow: 0 5px 15px rgba(255,75,75,0.4) !important;
        }
        .stButton > button:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 25px rgba(255,75,75,0.6) !important;
            background: linear-gradient(135deg, #FF8E53, #FF4B4B) !important;
        }
        .stButton > button:active {
            transform: translateY(0) !important;
        }

        /* Download button — teal gradient */
        .stDownloadButton > button {
            background: linear-gradient(135deg, #43e97b, #38f9d7) !important;
            color: #000 !important;
            border: none !important;
            border-radius: 25px !important;
            padding: 0.65rem 2rem !important;
            font-weight: 600 !important;
            transition: all 0.3s ease !important;
        }
        .stDownloadButton > button:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 25px rgba(67,233,123,0.5) !important;
        }

        /* ══════════════════════════════════════════
           8. RADIO & CHECKBOX
        ══════════════════════════════════════════ */
        .stRadio label, .stCheckbox label {
            color: #e0e0e0 !important;
        }

        /* ══════════════════════════════════════════
           9. EXPANDERS
        ══════════════════════════════════════════ */
        .streamlit-expanderHeader {
            background-color: #1e1e2e !important;
            border-radius: 10px !important;
            font-weight: 600 !important;
            color: #e0e0e0 !important;
            border: 1px solid #333 !important;
        }
        .streamlit-expanderContent {
            background-color: #16162a !important;
            border: 1px solid #333 !important;
            border-radius: 0 0 10px 10px !important;
        }

        /* ══════════════════════════════════════════
           10. TABS
        ══════════════════════════════════════════ */
        .stTabs [data-baseweb="tab-list"] {
            gap: 8px;
            background: transparent;
        }
        .stTabs [data-baseweb="tab"] {
            background-color: #1e1e2e !important;
            border-radius: 10px !important;
            padding: 10px 20px !important;
            color: #a0aec0 !important;
            border: 1px solid #333 !important;
            font-weight: 500;
        }
        .stTabs [aria-selected="true"] {
            background: linear-gradient(135deg, #FF4B4B, #FF8E53) !important;
            color: white !important;
            border: none !important;
        }

        /* ══════════════════════════════════════════
           11. METRICS
        ══════════════════════════════════════════ */
        [data-testid="stMetricValue"] {
            font-size: 2rem !important;
            font-weight: 700 !important;
            background: linear-gradient(90deg, #FF4B4B, #FF8E53);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        [data-testid="stMetricLabel"] {
            color: #a0aec0 !important;
            font-size: 0.85rem !important;
        }

        /* ══════════════════════════════════════════
           12. ALERTS / MESSAGES
        ══════════════════════════════════════════ */
        .stsuccess, [data-testid="stSuccessMessage"] {
            background-color: rgba(67,233,123,0.1) !important;
            border: 1px solid #43e97b !important;
            border-radius: 10px !important;
        }
        .stwarning, [data-testid="stWarningMessage"] {
            background-color: rgba(255,193,7,0.1) !important;
            border: 1px solid #ffc107 !important;
            border-radius: 10px !important;
        }
        .sterror, [data-testid="stErrorMessage"] {
            background-color: rgba(255,75,75,0.1) !important;
            border: 1px solid #FF4B4B !important;
            border-radius: 10px !important;
        }
        .stinfo, [data-testid="stInfoMessage"] {
            background-color: rgba(79,172,254,0.1) !important;
            border: 1px solid #4facfe !important;
            border-radius: 10px !important;
        }

        /* ══════════════════════════════════════════
           13. SPINNER
        ══════════════════════════════════════════ */
        .stSpinner > div {
            border-top-color: #FF4B4B !important;
        }

        /* ══════════════════════════════════════════
           14. DIVIDER / HR
        ══════════════════════════════════════════ */
        hr {
            border-color: #2a2a3e !important;
            margin: 1.5rem 0 !important;
        }

        /* ══════════════════════════════════════════
           15. TABLES
        ══════════════════════════════════════════ */
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 1rem 0;
        }
        th {
            background: linear-gradient(135deg, #FF4B4B, #FF8E53) !important;
            color: white !important;
            padding: 12px !important;
            text-align: left;
            font-weight: 600;
        }
        td {
            padding: 10px 12px !important;
            border-bottom: 1px solid #333 !important;
            color: #e0e0e0 !important;
        }
        tr:hover td {
            background: rgba(255,75,75,0.07) !important;
        }

        /* ══════════════════════════════════════════
           16. FORM CONTAINER
        ══════════════════════════════════════════ */
        [data-testid="stForm"] {
            background: rgba(30,30,46,0.85) !important;
            padding: 2rem !important;
            border-radius: 15px !important;
            border: 1px solid #333 !important;
            box-shadow: 0 10px 30px rgba(0,0,0,0.35) !important;
        }

        /* ══════════════════════════════════════════
           17. MARKDOWN & HEADERS
        ══════════════════════════════════════════ */
        .stMarkdown { color: #e0e0e0; }
        h1 {
            background: linear-gradient(90deg, #FF4B4B, #FF8E53, #FFC837);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 800;
        }
        h2 { color: #FF8E53 !important; font-weight: 700; }
        h3 { color: #4facfe  !important; font-weight: 600; }

        /* ══════════════════════════════════════════
           18. SCROLLBAR
        ══════════════════════════════════════════ */
        ::-webkit-scrollbar       { width: 8px; }
        ::-webkit-scrollbar-track { background: #0E1117; }
        ::-webkit-scrollbar-thumb { background: #FF4B4B; border-radius: 10px; }

        /* ══════════════════════════════════════════
           19. REUSABLE UTILITY CLASSES
        ══════════════════════════════════════════ */

        /* Glass card — use in any page */
        .glass-card {
            background: rgba(255,255,255,0.05);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            border: 1px solid rgba(255,255,255,0.1);
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }

        /* AI response container */
        .response-container {
            background: rgba(30,30,46,0.9);
            border: 1px solid #2a2a3e;
            border-radius: 15px;
            padding: 2rem;
            margin: 1rem 0;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            border-left: 4px solid #FF4B4B;
        }

        /* Gradient text helper */
        .gradient-text {
            background: linear-gradient(90deg, #FF4B4B, #FF8E53, #FFC837);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 800;
        }

        /* Page sub-header */
        .page-header {
            border-left: 4px solid #FF4B4B;
            padding-left: 1rem;
            margin-bottom: 1.5rem;
        }
        .page-header h2 { margin: 0; }
        .page-header p  { margin: 0.2rem 0 0 0; color: #718096; font-size: 0.9rem; }

        /* Stat badge */
        .stat-badge {
            display: inline-block;
            background: rgba(255,75,75,0.15);
            border: 1px solid rgba(255,75,75,0.4);
            border-radius: 50px;
            padding: 6px 18px;
            font-size: 0.85rem;
            color: #FF4B4B;
            margin: 0.3rem;
            font-weight: 500;
        }

        /* ══════════════════════════════════════════
           20. ANIMATIONS
        ══════════════════════════════════════════ */
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes shine {
            to { background-position: 200% center; }
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1);    }
            50%       { transform: scale(1.05); }
        }
        @keyframes float {
            0%, 100% { transform: translateY(0);    }
            50%       { transform: translateY(-8px); }
        }

        .animate-fade-in   { animation: fadeInUp 0.7s ease-out; }
        .pulse-animation   { animation: pulse   2s   infinite;  }
        .float-animation   { animation: float   3s   ease-in-out infinite; }

        </style>
        """,
        unsafe_allow_html=True,
    )


def sidebar_branding() -> None:
    """
    Inject branding HTML into the sidebar (logo, tagline, credits).
    Call from any page after load_global_css().
    """
    with st.sidebar:
        st.markdown(
            """
            <div style="text-align:center; padding: 0.5rem 0 1rem 0;">
                <div style="font-size:2rem; font-weight:900;
                            background:linear-gradient(90deg,#FF4B4B,#FF8E53);
                            -webkit-background-clip:text;
                            -webkit-text-fill-color:transparent;">
                    ✈️ YatraSathi
                </div>
                <div style="font-size:0.75rem; color:#718096; margin-top:2px;">
                    AI-Powered Travel Planner
                </div>
            </div>
            <hr style="border-color:#3a2a3a; margin:0 0 0.5rem 0;">
            """,
            unsafe_allow_html=True,
        )

        # Push credits to the bottom using a spacer
        st.write("")
        st.markdown(
            """
            <div style="position:fixed; bottom:2rem; left:0; width:18rem;
                        padding: 1rem 1.5rem;
                        border-top: 1px solid #3a2a3a;">
                <div style="font-size:0.78rem; color:#556; line-height:1.7;">
                    🏆 <strong style="color:#FF8E53;">Cylsys AI Hackathon 2025</strong><br>
                    Made with ❤️ by <strong style="color:#e0e0e0;">YatraSathi Team</strong><br>
                    <span style="color:#4a5568;">Powered by Groq &amp; Gemini AI</span>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )
