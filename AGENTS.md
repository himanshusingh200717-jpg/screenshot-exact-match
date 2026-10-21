<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- All company data is read through src/lib/companies.ts (seed in Phase 1); swap that one module for database reads in Phase 2 so pages and normalizers stay untouched.
- Normalizers in src/lib/companyData.ts drop any CTC/stipend/selection-ratio keys; never display those fields.
