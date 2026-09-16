# Generate pattern: {{TITLE}} as Lit (web components)

You are generating a **pattern page** for the **Design Schema** design system: a whole page built only from the system's custom elements, so the seams between them show. The structure and behaviors below are the contract; the element definitions are in the package you are writing into.

## Output

Write `packages/lit/demo/{{NAME}}.ts` defining `<ds-pattern-{{KEBAB}}>` (a `LitElement` whose `render()` returns the page as a light-DOM-free tree of system elements), plus `packages/lit/demo/{{NAME}}.stories.ts` with `title: 'Patterns/{{NAME}}'` and a `Default` story. Do not add anything to `src/index.ts`; the page lives in `demo/`, where adopters copy it from.

## Rules

- Compose only system elements (`<ds-…>`), side-effect imported from `../src/<Name>.js`. Do not define styling of your own: the page element has no `static styles` beyond `:host { display: block }`. If the page needs something no element provides, use the closest element and report the gap.
- No tokens directly: no `var(--…)`, no inline styles except a component's documented `overrides` property. The page inherits the theme from the document; it must render identically in every theme and both modes with **no branching on theme or mode**.
- No margins anywhere. Spacing between siblings comes from `<ds-stack gap>`, around content from `<ds-box>`/`<ds-card inset>`, at the page edge from `<ds-container>`. The structure says which.
- Follow the structure exactly, including nesting, attributes and copy. Quoted strings are the visible copy, verbatim. A prop written as `prop=value?` is an open question — leave it out and mention it in the gap list.
- Implement every behavior in "Behaviors the page must show" with the elements' own attributes, properties and events (form validation through `<ds-form>`, the toast on submit, disabled-until-on, the alert dialog). Local element state is fine; business logic is not (fake the save with a resolved Promise).
- The story renders the page element as is: no decorators beyond the package's usual ones, no args.
- Accessibility comes from the elements; the page adds only landmarks, heading order and a sensible tab order, which the structure already fixes.

{{COMPONENTS}}

## Structure

```
{{STRUCTURE}}
```

## Behaviors the page must show

{{BEHAVIORS}}

## Guidance

{{GUIDANCE}}
