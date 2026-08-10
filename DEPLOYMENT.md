Deployment (Docker)
--------------------

This project includes Dockerfiles for the backend and frontend and a `docker-compose.yml` to run both together.

Build and run locally:

```bash
# build and start services
docker-compose up --build -d

# view backend logs
docker-compose logs -f backend

# view frontend logs
docker-compose logs -f frontend
```

Environment variables
- `OPENAI_API_KEY` (optional)
- `ANTHROPIC_API_KEY` (optional)
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` (optional, for real calls/SMS)

Automated CI/CD notes
- The Vercel deploy workflow is included and will auto-deploy the frontend when you push to `main`.
- For Render, once the service is imported and connected to the repo, Render will auto-deploy on pushes to the configured branch.


Ports:
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3002`

Notes:
- For production, provide secrets via your host env, a `.env` file, or your cloud provider's secret manager.
- You can push the built images to a registry (Docker Hub, GitHub Container Registry) and deploy to services like Render, Fly, or AWS ECS.
