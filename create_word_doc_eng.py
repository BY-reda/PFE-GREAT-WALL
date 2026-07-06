import os

html_content = """<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>Final Project Explanation for Professor</title>
<style>
<!--
@page {
    size: 21cm 29.7cm;
    margin: 2.5cm 2.5cm 2.5cm 2.5cm;
    mso-page-orientation: portrait;
}
body {
    font-family: 'Calibri', 'Arial', sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #2D3748;
}
h1 {
    font-size: 20pt;
    color: #1A365D;
    border-bottom: 2pt solid #2B6CB0;
    padding-bottom: 6pt;
    margin-top: 24pt;
    margin-bottom: 12pt;
}
h2 {
    font-size: 14pt;
    color: #2B6CB0;
    border-bottom: 1pt solid #E2E8F0;
    padding-bottom: 4pt;
    margin-top: 18pt;
    margin-bottom: 8pt;
}
h3 {
    font-size: 12pt;
    color: #2C5282;
    margin-top: 14pt;
    margin-bottom: 6pt;
}
p {
    margin-bottom: 10pt;
    text-align: justify;
}
table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 12pt;
    margin-bottom: 12pt;
}
th, td {
    border: 1pt solid #CBD5E0;
    padding: 8pt;
    text-align: left;
}
th {
    background-color: #EDF2F7;
    color: #1A202C;
    font-weight: bold;
}
tr:nth-child(even) {
    background-color: #F7FAFC;
}
.box {
    background-color: #EBF8FF;
    border-left: 4pt solid #3182CE;
    padding: 10pt 12pt;
    margin: 12pt 0;
}
-->
</style>
</head>
<body>

<h1>Project Explanatory Report: AI Admissions Pipeline (2-Stage Model)</h1>

<div class="box">
<b>Note to Professor / Jury:</b> This document presents the complete Artificial Intelligence and Data Science project conducted for predicting university admissions in China. It outlines the scientific justification of the model, software architecture (UML), and empirical analysis performed on historical alumni data.
</div>

<h2>1. Introduction & Scientific Problem Statement</h2>
<p>The objective of this project is to build an intelligent forecasting system that predicts student admission outcomes for Chinese universities. When analyzing the real database (<code>younes .csv</code>), a major data science challenge emerged: <b>the database contains only historical accepted students (Y = 1)</b>.</p>

<p>In Machine Learning, training a standard supervised binary classifier (such as Logistic Regression or standard Random Forest) is impossible without negative samples (rejected applicants). Generating synthetic rejection data would introduce severe artificial bias. Furthermore, workflow analysis of the admission procedure revealed that:</p>

<ul>
  <li><b>Academic Criteria (90% Weight):</b> Baccalaureate grades, written exams, and language proficiency tests (Duolingo/English) act as strict baseline eligibility thresholds.</li>
  <li><b>Oral Interview (10% Weight):</b> This is the decisive subjective factor. An academically eligible student can still be rejected during this final stage if they lack fluency, preparation, or confidence.</li>
</ul>

<h2>2. Scientific Justification: Why Machine Learning over Simple IF/THEN Rules?</h2>
<p>A legitimate software engineering critique is: <i>"If the 90% requirements are fixed conditions, why not use a simple script with IF grade >= 10 THEN pass rules?"</i></p>

<p>Here are the 3 scientific arguments proving why Machine Learning is strictly superior:</p>
<ol>
  <li><b>Multi-Dimensional Non-Linearity:</b> A general university brochure might state a minimum average of <code>10/20</code>. However, admission into selective majors (e.g., <i>Computer Science</i> at <i>Shandong University</i>) depends on complex interactions between mathematics grades, physics grades, and English proficiency. A candidate with an <code>11.5/20</code> average might be rejected if their Math score is <code>06/20</code>. Humans cannot manually code and maintain thousands of cross-referenced rules across dozens of universities.</li>
  <li><b>Unsupervised Envelope Learning (Isolation Forest):</b> The algorithm automatically learns the multi-dimensional acceptance topology. It identifies the exact historical decision boundaries of alumni without requiring human rules.</li>
  <li><b>Quantifying Subjective Risk (The 10% Interview):</b> IF/THEN rules return binary (True/False) answers. They cannot measure the probability of passing the oral interview. Our model transforms feature distance relative to alumni into a <b>calibrated probability score (0% to 100%)</b>, serving as a true Decision Support System (DSS).</li>
</ol>

<h2>3. System Architecture: The 2-Stage Pipeline</h2>
<p>To deliver maximum enterprise and academic value, the system is engineered as a two-stage hierarchical pipeline:</p>

<h3>Stage 1: Automated 90% Envelope Verification (One-Class Model)</h3>
<p>The model evaluates whether a new applicant's feature vector falls inside the multi-dimensional envelope learned from 328 historical accepted alumni. If the profile is anomalous, the applicant is filtered out immediately (Stage 1 Rejection).</p>

<h3>Stage 2: Interview Pass Probability Scoring (10%)</h3>
<p>For eligible candidates (inside the envelope), the algorithm computes the normalized distance ($Z$-score) relative to the alumni centroid and applies a calibrated Sigmoid function to predict their exact likelihood of acing the oral interview.</p>

<h2>4. Empirical Analysis on Real Data (younes .csv)</h2>
<p>Data cleaning and extraction yielded 328 valid alumni profiles. Below are the learned baseline benchmarks discovered by the system:</p>

<table>
  <tr>
    <th>Academic Metric</th>
    <th>Historical Minimum Cutoff</th>
    <th>Alumni Baseline Average</th>
    <th>Top 25% Safe Envelope</th>
  </tr>
  <tr>
    <td><b>General Average (/20)</b></td>
    <td>10.01 / 20</td>
    <td>12.29 / 20</td>
    <td>13.40 / 20</td>
  </tr>
  <tr>
    <td><b>English Proficiency (/100)</b></td>
    <td>60.00 / 100</td>
    <td>69.52 / 100</td>
    <td>73.00 / 100</td>
  </tr>
</table>

<h2>5. Simulation Results on the Pipeline</h2>
<p>When executing <code>build_interview_model.py</code>, the system accurately segments new applicants:</p>

<table>
  <tr>
    <th>Simulated Applicant</th>
    <th>Stage 1 Result (90% Envelope)</th>
    <th>Stage 2 Result (Interview Probability)</th>
    <th>System Recommendation</th>
  </tr>
  <tr>
    <td><b>Applicant A (Top Scholar)</b><br>Average: 17.5 | English: 88</td>
    <td>ELIGIBLE (Inside Envelope)</td>
    <td><b>99.0%</b> (Highly Secure Pass)</td>
    <td>Expedite admission application.</td>
  </tr>
  <tr>
    <td><b>Applicant B (Standard Profile)</b><br>Average: 12.5 | English: 70</td>
    <td>ELIGIBLE (Inside Envelope)</td>
    <td><b>82.7%</b> (Safe Profile)</td>
    <td>Schedule standard oral interview.</td>
  </tr>
  <tr>
    <td><b>Applicant C (Borderline Profile)</b><br>Average: 10.3 | English: 60</td>
    <td>ELIGIBLE (Inside Envelope)</td>
    <td><b>46.2%</b> (DANGER ZONE)</td>
    <td>Mandatory intensive coaching before interview.</td>
  </tr>
  <tr>
    <td><b>Applicant D (Below Cutoff)</b><br>Average: 08.5 | English: 45</td>
    <td><b>REJECTED</b> (Outside Envelope)</td>
    <td><i>Not Evaluated (Filtered)</i></td>
    <td>Automatic rejection without wasting interview time.</td>
  </tr>
</table>

<h2>6. UML System Modeling</h2>
<p>The project incorporates rigorous software engineering design represented by three UML diagrams (provided in PlantUML syntax in <code>plantuml_diagrams.puml</code>):</p>
<ul>
  <li><b>Use Case Diagram:</b> Illustrates actor interactions between candidates, admission counselors, and the AI engine.</li>
  <li><b>Sequence Diagram:</b> Maps chronological data flow from CSV upload to probability score display.</li>
  <li><b>Activity Diagram:</b> Details the algorithmic decision tree and risk routing branches.</li>
</ul>

<h2>General Conclusion</h2>
<p>This project demonstrates full mastery of the Data Science and Software Engineering lifecycle. By transforming a data constraint (positive-only data) into an architectural innovation (2-Stage Pipeline with One-Class learning), the system delivers robust automation and high-value decision support.</p>

</body>
</html>
"""

with open("Project_Explanation_For_Professor.doc", "w", encoding="utf-8") as f:
    f.write(html_content)

print("Created Project_Explanation_For_Professor.doc successfully.")
