# Generate pattern: {{TITLE}} for React (web)

You are generating a **pattern page** for the **Design Schema** design system: a whole page built only from the system's generated components, so the seams between them show. The structure and behaviors below are the contract; the component schemas are in the package you are writing into.

## Output

Write `packages/react/demo/{{NAME}}.tsx` exporting a function component named `{{NAME}}`, plus `packages/react/demo/{{NAME}}.stories.tsx` with `title: 'Patterns/{{NAME}}'` and a `Default` story. Do not add anything to `src/index.ts`; the page lives in `demo/`, where adopters copy it from.

## Rules

- Compose only system components, imported from `../src`. Do not write a new component, a wrapper with its own styling, or any element that carries visual decisions of its own. If the page needs something no component provides, use the closest component and report the gap.
- No tokens directly: no `var(--…)`, no CSS file, no `style` props except through a component's documented `overrides`. The page inherits the theme from the app; it must render identically in every theme and both modes with **no branching on theme or mode**.
- No margins anywhere. Spacing between siblings comes from `Stack` (`gap`), around content from `Box`/`Card` (`inset`), at the page edge from `Container`. The structure says which.
- Follow the structure exactly, including nesting, props and copy. Quoted strings are the visible copy, verbatim. A prop written as `prop=value?` is an open question — leave it out and mention it in the gap list.
- Implement every behavior in "Behaviors the page must show" with the components' own props and events (Form validation, Toast on submit, disabled-until-on, the AlertDialog). Local page state is fine; business logic is not (fake the save with a resolved Promise).
- The story renders the page as is: no decorators beyond the package's usual ones, no args.
- Accessibility comes from the components; the page adds only landmarks, heading order and a sensible tab order, which the structure already fixes.

{{COMPONENTS}}

## Structure

```
{{STRUCTURE}}
```

## Behaviors the page must show

{{BEHAVIORS}}

## Guidance

{{GUIDANCE}}
