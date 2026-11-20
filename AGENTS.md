<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## FaceAttend architecture

- All app data flows through `src/context/AppContext.tsx` (Cloud client, RLS as the signed-in user); pages never keep their own copies of records — one place owns loading, uploads and signed URLs.
- Institute separation is enforced in the database (RLS keyed on `user_roles.institute_id`), never in the UI — the UI can be bypassed.
- Roles live only in `public.user_roles`; the first account that calls `register_institute` becomes that institute's admin.
- Teacher/student login accounts are created only by server functions in `src/lib/accounts.functions.ts` after re-checking the caller's role — the service key must never reach the browser.
- Institute media is stored in the private `faceattend-media` bucket under `<institute_id>/<folder>/…` and shown via signed URLs — storage policies key on that first path segment.
- Face recognition runs in the browser (`src/lib/face.ts`, models served from `public/models/face`); only 128-number face signatures are stored — no third-party face API.
- Never seed sample institutes, people or attendance; the app must start empty and be filled by real users.
