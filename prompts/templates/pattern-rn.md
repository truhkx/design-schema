# Generate pattern: {{TITLE}} for React Native

You are generating a **pattern page** for the **Design Schema** design system: a whole screen built only from the system's generated components, so the seams between them show. The structure and behaviors below are the contract; the component definitions are in the package you are writing into.

## Output

Write `packages/rn/demo/{{NAME}}.tsx` exporting a function component named `{{NAME}}` (the screen), plus `packages/rn/demo/{{NAME}}.stories.tsx` with `title: 'Patterns/{{NAME}}'`, the package's `withTheme()` decorator, and a `Default` story. Do not add anything to `src/index.ts`; the screen lives in `demo/`, where adopters copy it from.

## Rules

- Compose only system components, imported from `../src`. The only React Native primitive allowed is a `ScrollView` around the page (the screen must scroll); no `View` with styles, no `Text` from react-native, no `StyleSheet`. If the screen needs something no component provides, use the closest component and report the gap.
- No tokens directly: no `useTheme()` in the page, no numbers for size or color, no `style` props except a component's documented `overrides`. The screen must render identically in every theme and both modes with **no branching on theme or mode**.
- No margins anywhere. Spacing between siblings comes from `Stack` (`gap`), around content from `Box`/`Card` (`inset`), at the screen edge from `Container`. The structure says which.
- Follow the structure exactly, including nesting, props and copy. Quoted strings are the visible copy, verbatim. A prop written as `prop=value?` is an open question — leave it out and mention it in the gap list. Where the structure names a web-only element (a `<main>` landmark, an `<h1>`), use the component's React Native mapping.
- Implement every behavior in "Behaviors the page must show" with the components' own props and events (Form validation, Toast on submit, disabled-until-on, the AlertDialog). Local screen state is fine; business logic is not (fake the save with a resolved Promise).
- The story renders the screen as is, under `withTheme()`, no args.
- Accessibility comes from the components; the screen adds only heading order and a sensible focus order, which the structure already fixes.

{{COMPONENTS}}

## Structure

```
{{STRUCTURE}}
```

## Behaviors the page must show

{{BEHAVIORS}}

## Guidance

{{GUIDANCE}}
