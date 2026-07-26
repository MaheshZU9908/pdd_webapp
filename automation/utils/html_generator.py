# automation/utils/html_generator.py
"""
HTML Report Generator — Produces execution-report.html and dashboard.html.
"""

import os
import json
from datetime import datetime

class HTMLReportGenerator:
    def __init__(self, output_dir="Test Results/HTML"):
        self.output_dir = output_dir

    def generate(self, test_cases, suite_name="PathoAI Multi-Layer Automation Suite"):
        os.makedirs(self.output_dir, exist_ok=True)

        total = len(test_cases)
        passed = sum(1 for tc in test_cases if tc.get("status") == "PASS")
        failed = sum(1 for tc in test_cases if tc.get("status") == "FAIL")
        skipped = sum(1 for tc in test_cases if tc.get("status") == "SKIP")
        pass_rate = round((passed / total * 100), 1) if total > 0 else 0
        total_time = round(sum(tc.get("duration", 0) for tc in test_cases), 2)
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{suite_name} — Execution Dashboard</title>
  <style>
    body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background:#0f172a; color:#f8fafc; margin:0; padding:2rem; }}
    .container {{ max-width: 1200px; margin: 0 auto; }}
    .header {{ background: linear-gradient(135deg, #1e293b, #0f172a); border:1px solid #334155; padding: 2rem; border-radius: 12px; margin-bottom: 2rem; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }}
    .header h1 {{ margin:0 0 0.5rem; color:#38bdf8; font-size:2rem; }}
    .meta {{ font-size:0.9rem; color:#94a3b8; }}
    .kpi-row {{ display: flex; gap: 1.5rem; margin-bottom: 2rem; }}
    .kpi-card {{ flex: 1; background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 1.5rem; text-align: center; }}
    .kpi-val {{ font-size: 2.2rem; font-weight: 800; margin-top: 0.3rem; }}
    .kpi-lbl {{ font-size: 0.8rem; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; }}
    .pass {{ color: #4ade80; }}
    .fail {{ color: #f87171; }}
    .skip {{ color: #fbbf24; }}
    .rate {{ color: #38bdf8; }}
    table {{ width: 100%; border-collapse: collapse; background: #1e293b; border-radius: 10px; overflow: hidden; }}
    th, td {{ padding: 1rem; text-align: left; border-bottom: 1px solid #334155; font-size: 0.9rem; }}
    th {{ background: #0f172a; color: #cbd5e1; font-weight: 700; }}
    tr:hover {{ background: #2d3748; }}
    .badge {{ padding: 0.3rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; display: inline-block; }}
    .badge-pass {{ background: rgba(74,222,128,0.15); color: #4ade80; border: 1px solid rgba(74,222,128,0.3); }}
    .badge-fail {{ background: rgba(248,113,113,0.15); color: #f87171; border: 1px solid rgba(248,113,113,0.3); }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{suite_name}</h1>
      <div class="meta">Execution Timestamp: <strong>{timestamp}</strong> · Target: <strong>Live GitHub Pages & API Services</strong></div>
    </div>

    <div class="kpi-row">
      <div class="kpi-card"><div class="kpi-lbl">Total Executed</div><div class="kpi-val">{total}</div></div>
      <div class="kpi-card"><div class="kpi-lbl">Passed</div><div class="kpi-val pass">{passed}</div></div>
      <div class="kpi-card"><div class="kpi-lbl">Failed</div><div class="kpi-val fail">{failed}</div></div>
      <div class="kpi-card"><div class="kpi-lbl">Pass Rate</div><div class="kpi-val rate">{pass_rate}%</div></div>
      <div class="kpi-card"><div class="kpi-lbl">Duration</div><div class="kpi-val">{total_time}s</div></div>
    </div>

    <h2>Test Execution Log Details</h2>
    <table>
      <thead>
        <tr>
          <th>Test ID</th>
          <th>Module</th>
          <th>Test Description</th>
          <th>Priority</th>
          <th>Duration</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
"""
        for tc in test_cases:
            st = tc.get("status", "PASS")
            b_class = "badge-pass" if st == "PASS" else "badge-fail"
            html_content += f"""
        <tr>
          <td><strong>{tc.get('test_id')}</strong></td>
          <td>{tc.get('module')}</td>
          <td>{tc.get('title')}</td>
          <td>{tc.get('priority', 'P2')}</td>
          <td>{tc.get('duration', 0.0)}s</td>
          <td><span class="badge {b_class}">{st}</span></td>
        </tr>
"""
        html_content += """
      </tbody>
    </table>
  </div>
</body>
</html>
"""

        exec_report_path = os.path.join(self.output_dir, "execution-report.html")
        dash_report_path = os.path.join(self.output_dir, "dashboard.html")

        with open(exec_report_path, "w", encoding="utf-8") as f:
            f.write(html_content)

        with open(dash_report_path, "w", encoding="utf-8") as f:
            f.write(html_content)

        return exec_report_path
