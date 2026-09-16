import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t}from"./iframe-Bb3rYm-L.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./names-szlHjJ4U.js";import{n as a,t as o}from"./Button-QLx-usSq.js";import{n as s,t as ee}from"./Heading-FSfsyrjK.js";import{n as c,t as te}from"./Text--Q5VwBjk.js";import{n as l,t as ne}from"./Icon-CBlYQ3eE.js";import{n as u,t as re}from"./Checkbox-yX_meQ_5.js";function ie(e){let t={},n={marginBlockEnd:`space.0`};for(let r of Object.keys(e)){let a=e[r];if(!a)continue;let o=m[r];o?t[o]=i(a):r===`captionSize`?n.fontSize=a:r===`captionWeight`&&(n.fontWeight=a)}return{rootStyle:t,captionOverrides:n}}function ae(){return typeof window<`u`&&typeof window.matchMedia==`function`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches}function oe(e,t){return typeof e==`string`&&typeof t==`string`?e.localeCompare(t,void 0,{numeric:!0}):Number(e)-Number(t)}function se(e,t){if(e.render)return e.render(t);let n=t[e.key];return n==null?``:String(n)}function ce(e,t){if(!t)return e.id;let n=e[t.key];return n==null?e.id:String(n)}function le(e,t){return e?.column===t&&e.direction===`ascending`?`descending`:`ascending`}function ue(e,t){return(le(t,e.key)===`ascending`?p.sortAscending:p.sortDescending).replace(`{column}`,e.header)}function de(e){return e.hideBelow?`ds-table__cell--hide-below-${e.hideBelow}`:null}function fe(e){return e.align===`end`?`ds-table__cell--align-end`:e.align===`center`?`ds-table__cell--align-center`:null}var d,f,p,m,pe,h;function g(){return(g=e((()=>{d=t(),r(),a(),u(),s(),l(),c(),f=n(),p={sortAscending:`Sort by {column}, ascending`,sortDescending:`Sort by {column}, descending`,sortedAnnouncement:`Sorted by {column}, {direction}`,selectAll:`Select all rows`,selectRow:`Select {rowName}`,selectedCount:`{count} of {total} selected`,actions:`Actions`,empty:`Nothing to show.`,loading:`Loading`,scrollHint:`Scroll sideways to see more columns`,rowCount:`{count} rows`},m={headerWeight:`--ds-table-header-weight`,headerSize:`--ds-table-header-size`,headerBorder:`--ds-table-header-border`,headerBorderWidth:`--ds-table-header-border-width`,headerShadow:`--ds-table-header-shadow`,rowBorder:`--ds-table-row-border`,rowBorderWidth:`--ds-table-row-border-width`,rowHover:`--ds-table-row-hover`,rowSelectedBorderWidth:`--ds-table-row-selected-border-width`,cellPaddingInline:`--ds-table-cell-padding-inline`,cellPaddingInlineCompact:`--ds-table-cell-padding-inline-compact`,cellPaddingBlock:`--ds-table-cell-padding-block`,cellGap:`--ds-table-cell-gap`,captionGap:`--ds-table-caption-gap`,stackedRowInset:`--ds-table-stacked-row-inset`,stackedRowGap:`--ds-table-stacked-row-gap`,stackedLabelSize:`--ds-table-stacked-label-size`,stackedLabelWeight:`--ds-table-stacked-label-weight`,stackedRowRadius:`--ds-table-stacked-row-radius`,stickyColumnShadow:`--ds-table-sticky-column-shadow`,scrollFade:`--ds-table-scroll-fade`,fontFamily:`--ds-table-font-family`,fontSize:`--ds-table-font-size`,lineHeight:`--ds-table-line-height`,numericFont:`--ds-table-numeric-font`,transition:`--ds-table-transition`},pe=typeof process<`u`&&!1,h=function({ref:e,caption:t,captionLevel:n=`2`,hideCaption:r=!1,columns:i,data:a,sort:s,defaultSort:c,selectable:l=`none`,selected:u,defaultSelected:m,responsive:h=`stack`,stickyHeader:g=!0,maxHeight:_=`none`,density:v=`comfortable`,striped:y=!1,emptyMessage:b,loading:x=!1,rowActions:S,footer:C,overrides:w,onSortChange:T,onSelectionChange:E,onRowPress:D,className:O,style:k,...A}){let j=`ds-table${(0,d.useId)()}`,M=`${j}-caption`,N=`${j}-row-count`,P=`${j}-scroll-hint`,F=(0,d.useRef)(null);(0,d.useImperativeHandle)(e,()=>F.current,[]);let I=(0,d.useRef)(null),L=(0,d.useRef)(null),R=(0,d.useMemo)(()=>i.find(e=>e.isRowHeader),[i]);if(pe){let e=i.filter(e=>e.isRowHeader).length;e!==1&&console.warn(`Table: exactly one column should set \`isRowHeader\`; found ${e}.`)}let z=s!==void 0,[B,V]=(0,d.useState)(c),H=z?s:B,[U,W]=(0,d.useState)(``),G=(0,d.useMemo)(()=>{if(z||!H)return a;let e=H.column,t=H.direction===`ascending`?1:-1;return[...a].sort((n,r)=>oe(n[e],r[e])*t)},[a,z,H]),K=e=>{let t=le(H,e.key),n={column:e.key,direction:t};z||V(n),T?.(n),W(p.sortedAnnouncement.replace(`{column}`,e.header).replace(`{direction}`,t))},me=u!==void 0,[he,ge]=(0,d.useState)(m??[]),q=me?u:he,J=(0,d.useMemo)(()=>new Set(q),[q]),Y=e=>{me||ge(e),E?.(e),W(p.selectedCount.replace(`{count}`,String(e.length)).replace(`{total}`,String(G.length)))},_e=(e,t)=>{if(l===`single`){Y(t?[e]:[]);return}Y(t?[...q,e]:q.filter(t=>t!==e))},X=(0,d.useMemo)(()=>G.map(e=>e.id),[G]),Z=X.length>0&&X.every(e=>J.has(e)),ve=!Z&&X.some(e=>J.has(e)),ye=()=>Y(Z?[]:X),[be,Q]=(0,d.useState)(!1);(0,d.useEffect)(()=>{let e=I.current;if(!g||!e||typeof IntersectionObserver>`u`){Q(!1);return}let t=new IntersectionObserver(([e])=>Q(!e.isIntersecting),{root:_===`viewport`?F.current:null,threshold:0});return t.observe(e),()=>t.disconnect()},[g,_]);let[xe,Se]=(0,d.useState)(!1),Ce=e=>Se(e.currentTarget.scrollLeft>0),we=e=>{if(e.key!==`ArrowRight`&&e.key!==`ArrowLeft`)return;let t=L.current;t&&(e.preventDefault(),t.scrollBy({left:e.key===`ArrowRight`?40:-40,behavior:ae()?`auto`:`smooth`}))},Te=(l===`none`?0:1)+i.length+ +!!S,Ee=[`ds-table`,`ds-table--${h}`,`ds-table--density-${v}`,g?`ds-table--sticky-header`:null,_===`viewport`?`ds-table--max-height-viewport`:null,y?`ds-table--striped`:null,be?`ds-table--scrolled-under-header`:null,O??null].filter(Boolean).join(` `),{rootStyle:De,captionOverrides:Oe}=w?ie(w):{rootStyle:void 0,captionOverrides:{marginBlockEnd:`space.0`}},ke=De||k?{...De,...k}:void 0,Ae=e=>{if(!e.sortable)return e.header;let t=H?.column===e.key?H?.direction:void 0;return(0,f.jsx)(o,{variant:`ghost`,size:`sm`,label:ue(e,H),trailingIcon:(0,f.jsx)(ne,{name:t===`descending`?`chevron-down`:`chevron-up`,inline:!0}),className:`ds-table__sort-button`,"data-part":`sortButton`,onClick:()=>K(e)})},je=e=>{let t=J.has(e.id),n=!!D&&!!R&&!R?.render,r=[`ds-table__tr`,n?`ds-table__tr--interactive`:null,t?`ds-table__tr--selected`:null].filter(Boolean).join(` `),a=ce(e,R);return(0,f.jsxs)(`tr`,{role:`row`,className:r,"data-part":`row`,"aria-selected":l===`none`?void 0:t?`true`:`false`,children:[l===`none`?null:(0,f.jsx)(`td`,{role:`cell`,className:`ds-table__td ds-table__td--select`,"data-part":`selectCell`,children:(0,f.jsx)(re,{label:p.selectRow.replace(`{rowName}`,a),name:`${j}-select-${e.id}`,checked:t,onChange:t=>_e(e.id,t)})}),i.map(t=>{let r=[`ds-table__cell`,fe(t),de(t)].filter(Boolean).join(` `);return t.isRowHeader?(0,f.jsx)(`th`,{scope:`row`,role:`rowheader`,className:r,"data-part":`rowHeader`,children:n?(0,f.jsx)(o,{variant:`ghost`,size:`sm`,label:a,className:`ds-table__row-button`,onClick:()=>D?.(e.id)}):se(t,e)},t.key):(0,f.jsx)(`td`,{role:`cell`,className:r,"data-part":`cell`,"data-label":t.header,children:se(t,e)},t.key)}),S?(0,f.jsx)(`td`,{role:`cell`,className:`ds-table__td ds-table__td--actions`,"data-part":`cell`,"data-label":p.actions,children:S(e)}):null]},e.id)},$=(0,f.jsxs)(`table`,{className:`ds-table__table`,"data-part":`table`,role:`table`,"aria-rowcount":G.length+1,"aria-colcount":Te,"aria-busy":x?`true`:void 0,"aria-describedby":N,children:[(0,f.jsx)(`caption`,{id:M,"data-part":`caption`,className:r?`ds-table__visually-hidden`:`ds-table__caption`,children:(0,f.jsx)(ee,{level:n,size:`md`,overrides:Oe,children:t})}),(0,f.jsxs)(`colgroup`,{children:[l===`none`?null:(0,f.jsx)(`col`,{style:{inlineSize:`var(--size-target-min)`}}),i.map(e=>(0,f.jsx)(`col`,{style:e.width===`min`?{inlineSize:`1%`}:e.width===`fill`?{inlineSize:`100%`}:void 0},e.key)),S?(0,f.jsx)(`col`,{}):null]}),(0,f.jsx)(`thead`,{className:`ds-table__thead`,role:`rowgroup`,"data-part":`header`,children:(0,f.jsxs)(`tr`,{role:`row`,className:`ds-table__tr ds-table__tr--header`,"data-part":`headerRow`,children:[l===`multiple`?(0,f.jsx)(`th`,{scope:`col`,role:`columnheader`,className:`ds-table__th ds-table__th--select`,"data-part":`selectAllCell`,children:(0,f.jsx)(re,{label:p.selectAll,name:`${j}-select-all`,checked:Z,indeterminate:ve,onChange:ye})}):l===`single`?(0,f.jsx)(`th`,{scope:`col`,role:`columnheader`,className:`ds-table__th ds-table__th--select`,"data-part":`selectAllCell`}):null,i.map(e=>(0,f.jsx)(`th`,{scope:`col`,role:`columnheader`,abbr:e.abbr,"aria-sort":e.sortable?H?.column===e.key?H.direction:`none`:void 0,"data-part":`columnHeader`,className:[`ds-table__th`,fe(e),de(e)].filter(Boolean).join(` `),children:Ae(e)},e.key)),S?(0,f.jsx)(`th`,{scope:`col`,role:`columnheader`,className:`ds-table__th ds-table__th--actions`,"data-part":`columnHeader`,children:(0,f.jsx)(`span`,{className:`ds-table__visually-hidden`,children:p.actions})}):null]})}),(0,f.jsx)(`tbody`,{className:`ds-table__tbody`,role:`rowgroup`,"data-part":`body`,children:G.length===0?(0,f.jsx)(`tr`,{role:`row`,className:`ds-table__tr`,children:(0,f.jsx)(`td`,{role:`cell`,colSpan:Te,className:`ds-table__empty`,children:(0,f.jsx)(te,{element:`p`,tone:`muted`,"data-part":`emptyState`,children:x?p.loading:b??p.empty})})}):G.map(e=>je(e))})]});return(0,f.jsxs)(`div`,{...A,ref:F,"data-ds":`Table`,"data-part":`container`,className:Ee,style:ke,children:[(0,f.jsx)(`div`,{ref:I,"aria-hidden":`true`,className:`ds-table__sentinel`}),(0,f.jsx)(`span`,{id:N,className:`ds-table__visually-hidden`,children:p.rowCount.replace(`{count}`,String(G.length))}),h===`scroll`?(0,f.jsxs)(`div`,{ref:L,className:[`ds-table__scroll-region`,xe?`ds-table__scroll-region--scrolled`:null].filter(Boolean).join(` `),"data-part":`scrollRegion`,role:`region`,"aria-labelledby":M,"aria-describedby":P,tabIndex:0,onScroll:Ce,onKeyDown:we,children:[$,(0,f.jsx)(`span`,{id:P,className:`ds-table__visually-hidden`,children:p.scrollHint})]}):$,C===void 0?null:(0,f.jsx)(`div`,{className:`ds-table__footer`,"data-part":`footer`,children:C}),(0,f.jsx)(`div`,{className:`ds-table__visually-hidden`,role:`status`,"aria-live":`polite`,children:U})]})},h.__docgenInfo={description:"Table — Design Schema, category: data.\n\nWhen to use:\nUse a Table for a list of records with three or more comparable fields: orders, invoices,\nmembers, inventory, results. Use `stack` (the default) when each row is a thing a person reads —\na person, an order — and `scroll` when the columns are what matters — figures across months, a\ncomparison. Add `sortable` to columns people compare by; `selectable: multiple` when bulk actions\nexist (put them in a Toolbar above the table that appears with the selection count). Put the\nrow's identity in the `isRowHeader` column, usually as a Link to its detail page.",methods:[],displayName:`Table`,props:{caption:{required:!0,tsType:{name:`string`},description:'What the table lists ("Open invoices"). Rendered as the `<caption>` and the table\'s accessible name.'},captionLevel:{required:!1,tsType:{name:`union`,raw:`TableCaptionLevel | undefined`,elements:[{name:`union`,raw:`'2' | '3' | '4' | 2 | 3 | 4`,elements:[{name:`literal`,value:`'2'`},{name:`literal`,value:`'3'`},{name:`literal`,value:`'4'`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`}]},{name:`undefined`}]},description:"Heading level of the caption in the page outline; its size is `captionSize` regardless.",defaultValue:{value:`'2'`,computed:!1}},hideCaption:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Visually hide the caption; it remains the accessible name.`,defaultValue:{value:`false`,computed:!1}},columns:{required:!0,tsType:{name:`Array`,elements:[{name:`TableColumn`}],raw:`TableColumn[]`},description:"Column definitions in display order. Exactly one should set `isRowHeader`."},data:{required:!0,tsType:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{ id: string; [key: string]: unknown }`,signature:{properties:[{key:`id`,value:{name:`string`,required:!0}},{key:{name:`string`},value:{name:`unknown`,required:!0}}]}}],raw:`TableRow[]`},description:"The rows. `id` must be stable; it is what selection and keys use."},sort:{required:!1,tsType:{name:`union`,raw:`TableSortState | undefined`,elements:[{name:`TableSortState`},{name:`undefined`}]},description:"Controlled sort state. The table shows it; the caller sorts `data`."},defaultSort:{required:!1,tsType:{name:`union`,raw:`TableSortState | undefined`,elements:[{name:`TableSortState`},{name:`undefined`}]},description:"Initial sort for uncontrolled use; the table then sorts `data` itself."},selectable:{required:!1,tsType:{name:`union`,raw:`TableSelectable | undefined`,elements:[{name:`union`,raw:`'none' | 'single' | 'multiple'`,elements:[{name:`literal`,value:`'none'`},{name:`literal`,value:`'single'`},{name:`literal`,value:`'multiple'`}]},{name:`undefined`}]},description:"Adds a selection column: `single` (radio-like) or `multiple` (with select-all).",defaultValue:{value:`'none'`,computed:!1}},selected:{required:!1,tsType:{name:`union`,raw:`string[] | undefined`,elements:[{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`undefined`}]},description:`Controlled selected row ids.`},defaultSelected:{required:!1,tsType:{name:`union`,raw:`string[] | undefined`,elements:[{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`undefined`}]},description:`Initially selected ids.`},responsive:{required:!1,tsType:{name:`union`,raw:`TableResponsive | undefined`,elements:[{name:`union`,raw:`'stack' | 'scroll'`,elements:[{name:`literal`,value:`'stack'`},{name:`literal`,value:`'scroll'`}]},{name:`undefined`}]},description:"Below the prose width: `stack` turns rows into labelled blocks, `scroll` keeps columns and scrolls horizontally.",defaultValue:{value:`'stack'`,computed:!1}},stickyHeader:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`The header row stays visible while the body scrolls.`,defaultValue:{value:`true`,computed:!1}},maxHeight:{required:!1,tsType:{name:`union`,raw:`TableMaxHeight | undefined`,elements:[{name:`union`,raw:`'none' | 'viewport'`,elements:[{name:`literal`,value:`'none'`},{name:`literal`,value:`'viewport'`}]},{name:`undefined`}]},description:"`viewport` caps the table at the viewport height and scrolls the body.",defaultValue:{value:`'none'`,computed:!1}},density:{required:!1,tsType:{name:`union`,raw:`TableDensity | undefined`,elements:[{name:`union`,raw:`'compact' | 'comfortable'`,elements:[{name:`literal`,value:`'compact'`},{name:`literal`,value:`'comfortable'`}]},{name:`undefined`}]},description:`Cell padding: comfortable or compact.`,defaultValue:{value:`'comfortable'`,computed:!1}},striped:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Alternate row backgrounds.`,defaultValue:{value:`false`,computed:!1}},emptyMessage:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:"Shown in place of the body when `data` is empty. Defaults to `copy.empty`."},loading:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"Data is being fetched: the body shows `copy.loading` and `aria-busy` is set. Existing rows stay visible.",defaultValue:{value:`false`,computed:!1}},rowActions:{required:!1,tsType:{name:`union`,raw:`((row: TableRow) => ReactNode) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Renders a trailing actions cell for each row (Buttons or a Menu).`},footer:{required:!1,tsType:{name:`ReactNode`},description:"Content below the table (pagination, a summary row). The schema names a `footer` anatomy part\nwithout further contract; this is its React slot."},overrides:{required:!1,tsType:{name:`union`,raw:`Partial<Record<TableOverridableBinding, TokenRef | undefined>> | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'headerWeight'
| 'headerSize'
| 'headerBorder'
| 'headerBorderWidth'
| 'headerShadow'
| 'rowBorder'
| 'rowBorderWidth'
| 'rowHover'
| 'rowSelectedBorderWidth'
| 'cellPaddingInline'
| 'cellPaddingInlineCompact'
| 'cellPaddingBlock'
| 'cellGap'
| 'captionSize'
| 'captionWeight'
| 'captionGap'
| 'stackedRowInset'
| 'stackedRowGap'
| 'stackedLabelSize'
| 'stackedLabelWeight'
| 'stackedRowRadius'
| 'stickyColumnShadow'
| 'scrollFade'
| 'fontFamily'
| 'fontSize'
| 'lineHeight'
| 'numericFont'
| 'transition'`,elements:[{name:`literal`,value:`'headerWeight'`},{name:`literal`,value:`'headerSize'`},{name:`literal`,value:`'headerBorder'`},{name:`literal`,value:`'headerBorderWidth'`},{name:`literal`,value:`'headerShadow'`},{name:`literal`,value:`'rowBorder'`},{name:`literal`,value:`'rowBorderWidth'`},{name:`literal`,value:`'rowHover'`},{name:`literal`,value:`'rowSelectedBorderWidth'`},{name:`literal`,value:`'cellPaddingInline'`},{name:`literal`,value:`'cellPaddingInlineCompact'`},{name:`literal`,value:`'cellPaddingBlock'`},{name:`literal`,value:`'cellGap'`},{name:`literal`,value:`'captionSize'`},{name:`literal`,value:`'captionWeight'`},{name:`literal`,value:`'captionGap'`},{name:`literal`,value:`'stackedRowInset'`},{name:`literal`,value:`'stackedRowGap'`},{name:`literal`,value:`'stackedLabelSize'`},{name:`literal`,value:`'stackedLabelWeight'`},{name:`literal`,value:`'stackedRowRadius'`},{name:`literal`,value:`'stickyColumnShadow'`},{name:`literal`,value:`'scrollFade'`},{name:`literal`,value:`'fontFamily'`},{name:`literal`,value:`'fontSize'`},{name:`literal`,value:`'lineHeight'`},{name:`literal`,value:`'numericFont'`},{name:`literal`,value:`'transition'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<TableOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<TableOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:`Per-instance style overrides: each entry sets the matching CSS hook to that token, inline.`},onSortChange:{required:!1,tsType:{name:`union`,raw:`((sort: TableSortState) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired when a sortable header is activated, with the new sort state.`},onSelectionChange:{required:!1,tsType:{name:`union`,raw:`((selected: string[]) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired with the new array of selected ids.`},onRowPress:{required:!1,tsType:{name:`union`,raw:`((id: string) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired when a row is activated, with its id. Only when the row-header column has no custom `render`."},ref:{required:!1,tsType:{name:`union`,raw:`Ref<HTMLDivElement> | undefined`,elements:[{name:`Ref`,elements:[{name:`HTMLDivElement`}],raw:`Ref<HTMLDivElement>`},{name:`undefined`}]},description:``}},composes:[`Omit`]}})))()}var _,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G;function K(){return(K=e((()=>{g(),a(),l(),c(),_=n(),v=[{id:`inv-1001`,customer:`Aster Studio`,status:`Open`,amount:420,due:`2026-09-30`},{id:`inv-1002`,customer:`Bramble & Co`,status:`Overdue`,amount:1280,due:`2026-08-15`},{id:`inv-1003`,customer:`Cedar Analytics`,status:`Open`,amount:96,due:`2026-10-04`},{id:`inv-1004`,customer:`Driftwood Supply`,status:`Paid`,amount:640,due:`2026-09-01`}],y={title:`Table/React`,component:h,args:{caption:`Open invoices`,columns:[{key:`customer`,header:`Customer`,isRowHeader:!0},{key:`status`,header:`Status`},{key:`amount`,header:`Amount (USD)`,abbr:`Amount`,align:`end`,sortable:!0,render:e=>`$${e.amount.toFixed(2)}`},{key:`due`,header:`Due date`,hideBelow:`prose`}],data:v},tags:[`autodocs`]},b={},x={args:{captionLevel:`2`}},S={args:{captionLevel:`3`}},C={args:{captionLevel:`4`}},w={args:{selectable:`none`}},T={args:{selectable:`single`}},E={args:{selectable:`multiple`}},D={args:{responsive:`stack`}},O={args:{responsive:`scroll`}},k={args:{maxHeight:`none`}},A={args:{maxHeight:`viewport`,data:[...v,...v,...v]}},j={args:{density:`compact`}},M={args:{density:`comfortable`}},N={args:{hideCaption:!0}},P={args:{stickyHeader:!1}},F={args:{striped:!0}},I={args:{data:[]}},L={args:{data:[],emptyMessage:`No invoices match these filters.`}},R={args:{loading:!0}},z={args:{loading:!0,data:[]}},B={args:{defaultSort:{column:`amount`,direction:`descending`}}},V={args:{rowActions:e=>(0,_.jsx)(o,{variant:`ghost`,size:`sm`,iconOnly:!0,label:`Open ${e.customer}`,leadingIcon:(0,_.jsx)(ne,{name:`ellipsis`,inline:!0})})}},H={args:{onRowPress:()=>void 0}},U={args:{footer:(0,_.jsxs)(te,{element:`p`,size:`sm`,tone:`muted`,children:[`Showing `,v.length,` of `,v.length,` invoices.`]})}},W={args:{selectable:`multiple`,rowActions:e=>(0,_.jsx)(o,{variant:`ghost`,size:`sm`,label:`View ${e.customer}`})}},G=[`Default`,`CaptionLevel2`,`CaptionLevel3`,`CaptionLevel4`,`SelectableNone`,`SelectableSingle`,`SelectableMultiple`,`ResponsiveStack`,`ResponsiveScroll`,`MaxHeightNone`,`MaxHeightViewport`,`DensityCompact`,`DensityComfortable`,`HideCaption`,`NoStickyHeader`,`Striped`,`Empty`,`EmptyWithMessage`,`Loading`,`LoadingEmpty`,`DefaultSort`,`WithRowActions`,`InteractiveRows`,`WithFooter`,`Keyboard`],b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '2'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '3'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '4'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'none'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'single'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'multiple'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    responsive: 'stack'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    responsive: 'scroll'
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    maxHeight: 'none'
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    maxHeight: 'viewport',
    data: [...DATA, ...DATA, ...DATA]
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    density: 'compact'
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    density: 'comfortable'
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    hideCaption: true
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    stickyHeader: false
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    striped: true
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    data: []
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    data: [],
    emptyMessage: 'No invoices match these filters.'
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true,
    data: []
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    defaultSort: {
      column: 'amount',
      direction: 'descending'
    }
  }
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    rowActions: row => <Button variant="ghost" size="sm" iconOnly label={\`Open \${(row as Invoice).customer}\`} leadingIcon={<Icon name="ellipsis" inline />} />
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    onRowPress: () => undefined
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    footer: <Text element="p" size="sm" tone="muted">\r
        Showing {DATA.length} of {DATA.length} invoices.\r
      </Text>
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'multiple',
    rowActions: row => <Button variant="ghost" size="sm" label={\`View \${(row as Invoice).customer}\`} />
  }
}`,...W.parameters?.docs?.source},description:{story:`Open/present with at least three focusable children, for the keyboard gate: the sortable\r
header's Button, the select-all Checkbox plus one per row, and a trailing action Button per row.`,...W.parameters?.docs?.description}}}})))()}K();export{x as CaptionLevel2,S as CaptionLevel3,C as CaptionLevel4,b as Default,B as DefaultSort,M as DensityComfortable,j as DensityCompact,I as Empty,L as EmptyWithMessage,N as HideCaption,H as InteractiveRows,W as Keyboard,R as Loading,z as LoadingEmpty,k as MaxHeightNone,A as MaxHeightViewport,P as NoStickyHeader,O as ResponsiveScroll,D as ResponsiveStack,E as SelectableMultiple,w as SelectableNone,T as SelectableSingle,F as Striped,U as WithFooter,V as WithRowActions,G as __namedExportsOrder,y as default};