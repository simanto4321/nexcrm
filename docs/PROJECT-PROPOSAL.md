# NexCRM — Project Proposal

**Course:** CSE Capstone Project  
**Date:** July 2026  

---

## 1. Project Name

**NexCRM — Multi-Tenant AI-Powered Customer Relationship Management System**

---

## 2. Introduction

A **Customer Relationship Management (CRM)** system helps businesses store and manage customer data, track sales deals through pipeline stages, assign tasks to team members, and monitor performance from one place. Users log in under their company (tenant), add contacts, move deals from *New* to *Won/Lost*, and receive updates via dashboard, email, or chat — keeping sales and support work organized and visible to the whole team.

**NexCRM** is our multi-tenant CRM platform built on **FastAPI**, **PostgreSQL (Supabase)**, and **React**. The **web application is fully completed and already live-hosted** — including landing page, premium CRM workspace, AI chat assistant, Telegram integration, and email notifications. **This proposal focuses on building the Android mobile app** for the same platform, using Expo (React Native) with premium UI/UX suited for mobile devices.

---

## 3. Objectives

### 3.1 Primary Objectives (Android App)

1. **Build an Android application** using Expo that connects to the existing live NexCRM API — no duplicate backend logic.

2. **Match web functionality** on mobile: tenant login, dashboard, contacts, deal pipeline, tasks, tenant settings (admin), and floating AI chat with voice support.

3. **Design premium mobile UI/UX** — not a shrunk website. Use bottom tab navigation, touch-friendly lists, readable typography, and NexCRM branding (red accent, clean cards) adapted for one-handed Android use.

4. **Implement role-based access** — sales reps see CRM modules only; tenant admins also see settings, same as web.

5. **Deliver a installable Android build** (Expo Go demo and/or preview APK) for instructor evaluation.

### 3.2 Supporting Objectives

6. Document mobile setup, API usage, and build steps for academic submission.

7. Ensure the app works against the **live hosted backend** so demo works outside localhost.

---

## 4. Android App — Scope and Design

The Android app shares authentication, database, and business rules with the completed web platform. All data flows through the existing REST API.

| Feature | Web (completed, live) | Android (this project) |
|---------|----------------------|------------------------|
| Login (email + company code) | ✓ | Build |
| Dashboard | ✓ | Build |
| Contacts | ✓ | Build |
| Deal pipeline | ✓ | Build (touch-optimized) |
| Tasks | ✓ | Build |
| Settings (admin) | ✓ | Build |
| AI chat + voice | ✓ | Build |
| Landing / marketing page | ✓ | App splash + login (mobile-native) |

**UI/UX approach:** The web already has a premium design — landing page, Zoho-inspired workspace, floating AI bubble. On Android we will carry the same brand and features with **mobile-native patterns**: bottom tabs, swipe lists, floating chat bubble for thumb reach, and a vertical deal pipeline suited for small screens.

---

## 5. Technology Stack

| Layer | Technology | Status |
|-------|------------|--------|
| Backend API | FastAPI, SQLAlchemy, JWT | Complete (live) |
| Database | PostgreSQL (Supabase) | Complete |
| Web frontend | React, Vite, Tailwind | Complete (live hosted) |
| **Mobile app** | **Expo (React Native)** | **In scope** |
| AI / Telegram / Email | Ollama, FAQ, webhooks, SMTP | Complete (via API) |

---

## 6. Expected Outcomes

- A working **Android app** with full CRM features and premium mobile UI/UX  
- Connection to the **live hosted** NexCRM API for real-world demo  
- Feature parity with web: contacts, pipeline, tasks, AI chat, admin settings  
- Documentation and build instructions for submission  

---

## 7. Current Status

| Component | Status |
|-----------|--------|
| Backend + Supabase | ✓ Complete |
| Web frontend + landing page | ✓ Complete |
| Live web hosting | ✓ Complete |
| AI chat, Telegram, email | ✓ Complete |
| **Android mobile app** | **Current focus** |

---

## 8. Conclusion

NexCRM’s web platform is finished and live. This project extends it to Android so sales teams can manage contacts, deals, and tasks on the go — with the same capabilities as the web, presented in a premium, mobile-first design.

---

*Prepared for academic submission — NexCRM Capstone Project*
