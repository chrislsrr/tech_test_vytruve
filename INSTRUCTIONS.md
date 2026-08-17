# Technical Test — Vytruve

## Context
Vytruve is an international company providing a digital and 3D printing
solution for orthoprosthetists.

For this test, you will build an application that lets an orthoprosthetist manage their patients and request/show the 3D printing of sockets. To request sockets printing you will interact with an API Vytruve made available to you (documentation provided in the appendix). This API is connected to a virtual production center: it lets you create 3D print requests and track their status, and it schedules prints based on machine availability.

## Required Stack
- Front end: React
- Back end: NestJS

## Expectations
An orthoprosthetist must be able to:
- sign up and log in
- create patients and view the list of their patients
- upload 3D files to a patient's record and download them
  (sample files provided in the appendix)
- request the printing of a 3D file — The orthoprosthetist simply requests the printing of a file they have uploaded and expects the print to eventually complete successfully.
- view the list of a patient's print requests, including their status
  and progress

## Data Model
Minimal — extend it to fit your needs:
- Patient: last name, first name, age
- Print request: reference, file

## Evaluation
- Architecture and code organization
- Data validation and error handling (API unavailable, etc.)
- README: setup, how to run the project, technical choices and trade-offs
- Git history

## Terms
- Suggested duration: one afternoon — if you run out of time, prioritize
  and document in the README what you would have done with more time
- Deliverable: Git repo, within 1 week
- AI assistants: allowed — describe in the README how you used them
- Questions: Julien Maurat — 06 42 57 42 59 / j.maurat@vytruve.com
