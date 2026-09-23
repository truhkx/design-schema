import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t}from"./iframe-BaAix2rE.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./names-szlHjJ4U.js";import{n as a,t as o}from"./Button-CXwJSRqr.js";import{n as s,t as ee}from"./Heading-CeutS2sZ.js";import{n as c,t as l}from"./Text-BmznDQS2.js";import{n as te,t as ne}from"./Icon-CNCpSr-m.js";import{n as u,t as d}from"./Link-DHkk5TA_.js";import{n as re,t as ie}from"./Checkbox-KLJFL1rx.js";function ae(e){let t={};for(let n of Object.keys(e)){let r=v[n],a=e[n];r&&a&&(t[r]=i(a))}return t}function oe(e,t){return e==null?t==null?0:1:t==null?-1:typeof e==`number`&&typeof t==`number`?e-t:String(e).localeCompare(String(t),void 0,{numeric:!0})}function f(e){return e==null?``:String(e)}function p(...e){return e.filter(Boolean).join(` `)}function se(){return typeof document<`u`&&document.documentElement.lang?document.documentElement.lang:void 0}function ce(e,t){let n=e.trim(),r=Number.parseFloat(n);if(!Number.isFinite(r))return NaN;if(!n.endsWith(`rem`))return r;let i=Number.parseFloat(getComputedStyle(t.ownerDocument.documentElement).fontSize);return Number.isFinite(i)?r*i:NaN}function m({ref:e,caption:t,captionLevel:n=`2`,footer:r,hideCaption:i=!1,columns:a,data:s,sort:c,defaultSort:te,selectable:u=`none`,selected:d,defaultSelected:re,responsive:m=`stack`,stickyHeader:v=!0,maxHeight:y=`none`,density:b=`comfortable`,striped:x=!1,emptyMessage:S,loading:C=!1,rowActions:w,overrides:T,onSortChange:E,onSelectionChange:D,onRowPress:O,...k}){let A=(0,h.useId)(),j=`${A}-caption`,M=`${A}-row-count`,N=`${A}-scroll-hint`,P=(0,h.useRef)(null);(0,h.useImperativeHandle)(e,()=>P.current,[]);let F=(0,h.useRef)(null),I=(0,h.useRef)(null),L=a.find(e=>e.isRowHeader);a.filter(e=>e.isRowHeader).length;let R=!!(O&&L&&!L.render),[z,B]=(0,h.useState)(te),V=c!==void 0,H=V?c:z,U=(0,h.useMemo)(()=>{if(V||!H)return s;let e=H.direction===`ascending`?1:-1;return[...s].sort((t,n)=>oe(t[H.column],n[H.column])*e)},[s,V,H]),[W,G]=(0,h.useState)(``),K=e=>{let t=H?.column===e.key&&H.direction===`ascending`?`descending`:`ascending`;V||B({column:e.key,direction:t}),E?.(e.key,t),G(_.sortedAnnouncement.replace(`{column}`,e.header).replace(`{direction}`,t))},[q,J]=(0,h.useState)(re??[]),Y=d!==void 0,X=Y?d:q,Z=new Set(X),Q=e=>{Y||J(e),D?.(e),G(_.selectedCount.replace(`{count}`,String(e.length)).replace(`{total}`,String(s.length)))},le=(e,t)=>{Q(u===`single`?t?[e]:[]:t?[...X.filter(t=>t!==e),e]:X.filter(t=>t!==e))},ue=s.length>0&&s.every(e=>Z.has(e.id)),de=!ue&&s.some(e=>Z.has(e.id)),fe=()=>Q(ue?[]:s.map(e=>e.id)),pe=v&&(m!==`scroll`||y===`viewport`),[me,he]=(0,h.useState)(!1);(0,h.useEffect)(()=>{let e=I.current;if(!pe||!e||typeof IntersectionObserver>`u`){he(!1);return}let t=new IntersectionObserver(e=>{let t=e[e.length-1];if(!t)return;let n=t.rootBounds?.top??0,r=!t.isIntersecting&&t.boundingClientRect.top<n;he(e=>e===r?e:r)},{root:y===`viewport`?F.current:null});return t.observe(e),()=>t.disconnect()},[pe,y,m]);let[ge,_e]=(0,h.useState)(!1),[ve,ye]=(0,h.useState)(!1),be=e=>{let t=e.scrollWidth-e.clientWidth,n=Math.abs(e.scrollLeft),r=n>=1,i=t-n>=1;_e(e=>e===r?e:r),ye(e=>e===i?e:i)},xe=e=>be(e.currentTarget);(0,h.useEffect)(()=>{let e=F.current;if(m!==`scroll`||!e||typeof ResizeObserver>`u`)return;let t=new ResizeObserver(()=>be(e));t.observe(e);let n=e.querySelector(`table`);return n&&t.observe(n),()=>t.disconnect()},[m]);let Se=e=>{if(e.target!==e.currentTarget||e.key!==`ArrowRight`&&e.key!==`ArrowLeft`)return;let t=e.currentTarget,n=ce(getComputedStyle(t).getPropertyValue(`--space-10`),t);Number.isFinite(n)&&(e.preventDefault(),t.scrollBy({left:e.key===`ArrowRight`?n:-n}))},Ce=(e,t)=>{if(!R)return;let n=e.target.closest(`button, a, input, select, textarea, label, [tabindex]`);n&&e.currentTarget.contains(n)||O?.(t)},we=(u===`none`?0:1)+a.length+ +!!w,Te=new Intl.PluralRules(se()).select(s.length)===`one`?`one`:`other`,Ee=_.rowCount[Te].replace(`{count}`,String(s.length)),$=(e,t)=>p(e,t.align&&t.align!==`start`&&`ds-table__cell--align-${t.align}`,t.width&&t.width!==`auto`&&`ds-table__cell--width-${t.width}`,t.hideBelow&&`ds-table__cell--hide-below-${t.hideBelow}`,t.isRowHeader&&`ds-table__cell--row-header`),De=(0,g.jsxs)(`table`,{role:`table`,"aria-labelledby":j,"aria-describedby":M,"aria-rowcount":s.length+1,"aria-colcount":we,"aria-busy":C?!0:void 0,"data-part":`table`,className:`ds-table__table`,children:[(0,g.jsx)(`thead`,{role:`rowgroup`,"data-part":`header`,className:`ds-table__header`,children:(0,g.jsxs)(`tr`,{role:`row`,"data-part":`headerRow`,className:`ds-table__header-row`,children:[u===`multiple`?(0,g.jsx)(`th`,{role:`columnheader`,scope:`col`,"data-part":`selectAllCell`,className:`ds-table__select`,children:(0,g.jsx)(ie,{label:_.selectAll,hideLabel:!0,name:`${A}-select-all`,checked:ue,indeterminate:de,onChange:fe})}):u===`single`?(0,g.jsx)(`td`,{role:`cell`,className:`ds-table__select`}):null,a.map(e=>{let t=H?.column===e.key?H.direction:void 0,n=t===`ascending`?`descending`:`ascending`;return(0,g.jsx)(`th`,{role:`columnheader`,scope:`col`,abbr:e.abbr,"aria-sort":t,"data-part":`columnHeader`,className:$(`ds-table__column-header`,e),children:e.sortable?(0,g.jsx)(o,{variant:`ghost`,size:`sm`,label:e.header,accessibleName:(n===`ascending`?_.sortAscending:_.sortDescending).replace(`{column}`,e.header),trailingIcon:t?(0,g.jsx)(ne,{name:t===`ascending`?`chevron-up`:`chevron-down`,inline:!0}):void 0,overrides:{fontWeight:T?.headerWeight??`font.weight.semibold`,iconGap:T?.cellGap??`layout.gap.tight`},onClick:()=>K(e)}):e.header},e.key)}),w?(0,g.jsx)(`th`,{role:`columnheader`,scope:`col`,"data-part":`columnHeader`,className:`ds-table__column-header`,children:(0,g.jsx)(`span`,{className:`ds-table__visually-hidden`,children:_.actions})}):null]})}),(0,g.jsx)(`tbody`,{role:`rowgroup`,"data-part":`body`,className:`ds-table__body`,children:U.length===0?(0,g.jsx)(`tr`,{role:`row`,className:`ds-table__row ds-table__row--empty`,children:(0,g.jsx)(`td`,{role:`cell`,colSpan:we,className:`ds-table__empty`,children:(0,g.jsx)(l,{element:`p`,tone:`muted`,"data-part":`emptyState`,children:C?_.loading:S??_.empty})})}):U.map(e=>{let t=Z.has(e.id),n=L&&f(e[L.key])||e.id;return(0,g.jsxs)(`tr`,{role:`row`,"aria-selected":u===`none`?void 0:t,"data-part":`row`,className:p(`ds-table__row`,t&&`ds-table__row--selected`,R&&`ds-table__row--interactive`),onClick:R?t=>Ce(t,e.id):void 0,children:[u===`none`?null:(0,g.jsx)(`td`,{role:`cell`,"data-part":`selectCell`,className:`ds-table__select`,children:(0,g.jsx)(ie,{label:_.selectRow.replace(`{rowName}`,n),hideLabel:!0,name:`${A}-select`,value:e.id,checked:t,onChange:t=>le(e.id,t)})}),a.map(t=>t===L?(0,g.jsx)(`th`,{role:`rowheader`,scope:`row`,"data-part":`rowHeader`,className:$(`ds-table__row-header`,t),children:R?(0,g.jsx)(o,{variant:`ghost`,size:`sm`,label:n,onClick:()=>O?.(e.id)}):t.render?t.render(e):f(e[t.key])},t.key):(0,g.jsx)(`td`,{role:`cell`,"data-part":`cell`,"data-label":t.header,className:$(`ds-table__cell`,t),children:t.render?t.render(e):f(e[t.key])},t.key)),w?(0,g.jsx)(`td`,{role:`cell`,"data-part":`cell`,"data-label":_.actions,className:`ds-table__cell ds-table__cell--actions`,children:(0,g.jsx)(`div`,{className:`ds-table__actions`,children:w(e)})}):null]},e.id)})})]}),Oe=p(`ds-table__frame`,ge&&`ds-table__frame--scrolled`),ke=(0,g.jsx)(`div`,{ref:I,"aria-hidden":`true`,className:`ds-table__sentinel`});return(0,g.jsxs)(`div`,{...k,ref:P,"data-ds":`Table`,"data-part":`container`,className:p(`ds-table`,`ds-table--${m}`,`ds-table--${b}`,`ds-table--max-height-${y}`,v&&`ds-table--sticky-header`,x&&`ds-table--striped`,me&&`ds-table--scrolled-under`,i&&`ds-table--hide-caption`),style:T?ae(T):void 0,children:[(0,g.jsx)(ee,{id:j,"data-part":`caption`,level:n,size:`md`,overrides:{fontSize:T?.captionSize??`font.size.md`,fontWeight:T?.captionWeight??`font.weight.semibold`,marginBlockEnd:i?`space.0`:T?.captionGap??`space.2`},children:t}),(0,g.jsx)(`span`,{id:M,className:`ds-table__visually-hidden`,children:Ee}),m===`scroll`?(0,g.jsx)(`div`,{className:`ds-table__scroll-outline`,children:(0,g.jsxs)(`div`,{ref:F,role:`region`,"aria-labelledby":j,"aria-describedby":N,tabIndex:0,"data-part":`scrollRegion`,className:p(Oe,`ds-table__scroll-region`,ge&&`ds-table__scroll-region--fade-start`,ve&&`ds-table__scroll-region--fade-end`),onScroll:xe,onKeyDown:Se,children:[ke,De]})}):(0,g.jsxs)(`div`,{ref:F,className:Oe,children:[ke,De]}),m===`scroll`?(0,g.jsx)(`span`,{id:N,className:`ds-table__visually-hidden`,children:_.scrollHint}):null,(0,g.jsx)(`div`,{"aria-live":`polite`,className:`ds-table__loading`,children:C&&U.length>0?(0,g.jsx)(l,{element:`p`,tone:`muted`,size:`sm`,children:_.loading}):null}),r!=null&&r!==!1?(0,g.jsx)(`div`,{"data-part":`footer`,className:`ds-table__footer`,children:typeof r==`string`?(0,g.jsx)(l,{element:`p`,overrides:{fontFamily:T?.fontFamily??`font.family.body`,fontSize:T?.fontSize??`font.size.sm`,lineHeight:T?.lineHeight??`font.lineHeight.normal`},children:r}):r}):null,(0,g.jsx)(`div`,{role:`status`,"aria-live":`polite`,className:`ds-table__visually-hidden`,children:W})]})}var h,g,_,v;function y(){return(y=e((()=>{h=t(),r(),a(),re(),s(),te(),c(),g=n(),_={sortAscending:`Sort by {column}, ascending`,sortDescending:`Sort by {column}, descending`,sortedAnnouncement:`Sorted by {column}, {direction}`,selectAll:`Select all rows`,selectRow:`Select {rowName}`,selectedCount:`{count} of {total} selected`,actions:`Actions`,empty:`Nothing to show.`,loading:`Loading`,scrollHint:`Scroll sideways to see more columns`,rowCount:{one:`{count} row`,other:`{count} rows`}},v={headerWeight:`--ds-table-header-weight`,headerSize:`--ds-table-header-size`,headerBorder:`--ds-table-header-border`,headerBorderWidth:`--ds-table-header-border-width`,headerShadow:`--ds-table-header-shadow`,rowBorder:`--ds-table-row-border`,rowBorderWidth:`--ds-table-row-border-width`,rowHover:`--ds-table-row-hover`,cellPaddingInline:`--ds-table-cell-padding-inline`,cellPaddingBlock:`--ds-table-cell-padding-block`,cellGap:`--ds-table-cell-gap`,stackedRowInset:`--ds-table-stacked-row-inset`,stackedRowGap:`--ds-table-stacked-row-gap`,stackedBlockGap:`--ds-table-stacked-block-gap`,stackedLabelSize:`--ds-table-stacked-label-size`,stackedLabelWeight:`--ds-table-stacked-label-weight`,stackedRowRadius:`--ds-table-stacked-row-radius`,stickyColumnShadow:`--ds-table-sticky-column-shadow`,scrollFade:`--ds-table-scroll-fade`,fontFamily:`--ds-table-font-family`,fontSize:`--ds-table-font-size`,lineHeight:`--ds-table-line-height`,numericFont:`--ds-table-numeric-font`,transition:`--ds-table-transition`},m.__docgenInfo={description:"Table — Design Schema, category: data.\n\nWhen to use:\nUse a Table for a list of records with three or more comparable fields: orders, invoices, members, inventory, results. Use `stack` (the default) when each row is a thing a person reads — a person, an order — and `scroll` when the columns are what matters — figures across months, a comparison. Add `sortable` to columns people compare by; `selectable: multiple` when bulk actions exist (put them in a Toolbar above the table that appears with the selection count). Put the row's identity in the `isRowHeader` column, usually as a Link to its detail page.",methods:[],displayName:`Table`,props:{caption:{required:!0,tsType:{name:`string`},description:'What the table lists ("Open invoices"). Rendered as the caption and the accessible name; visually hidden with `hideCaption` when a Heading directly above already says it.'},captionLevel:{required:!1,tsType:{name:`union`,raw:`TableCaptionLevel | undefined`,elements:[{name:`union`,raw:`'2' | '3' | '4' | 2 | 3 | 4`,elements:[{name:`literal`,value:`'2'`},{name:`literal`,value:`'3'`},{name:`literal`,value:`'4'`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`}]},{name:`undefined`}]},description:`Heading level of the caption in the page outline; its size is captionSize regardless.`,defaultValue:{value:`'2'`,computed:!1}},footer:{required:!1,tsType:{name:`ReactNode`},description:"Content below the table: a row count, pagination, a total. Rendered in the `footer` part with the table's font: a string footer renders in Text with the `fontFamily`/`fontSize`/`lineHeight` bindings; other content brings its own typography."},hideCaption:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Visually hide the caption; it remains the accessible name.`,defaultValue:{value:`false`,computed:!1}},columns:{required:!0,tsType:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{
  key: string;
  header: string;
  abbr?: string;
  align?: TableColumnAlign;
  sortable?: boolean;
  width?: TableColumnWidth;
  isRowHeader?: boolean;
  hideBelow?: TableColumnHideBelow;
  render?: (row: TableRow) => ReactNode;
}`,signature:{properties:[{key:`key`,value:{name:`string`,required:!0}},{key:`header`,value:{name:`string`,required:!0}},{key:`abbr`,value:{name:`string`,required:!1}},{key:`align`,value:{name:`union`,raw:`'start' | 'end' | 'center'`,elements:[{name:`literal`,value:`'start'`},{name:`literal`,value:`'end'`},{name:`literal`,value:`'center'`}],required:!1}},{key:`sortable`,value:{name:`boolean`,required:!1}},{key:`width`,value:{name:`union`,raw:`'auto' | 'min' | 'fill'`,elements:[{name:`literal`,value:`'auto'`},{name:`literal`,value:`'min'`},{name:`literal`,value:`'fill'`}],required:!1}},{key:`isRowHeader`,value:{name:`boolean`,required:!1}},{key:`hideBelow`,value:{name:`union`,raw:`'prose' | 'content'`,elements:[{name:`literal`,value:`'prose'`},{name:`literal`,value:`'content'`}],required:!1}},{key:`render`,value:{name:`signature`,type:`function`,raw:`(row: TableRow) => ReactNode`,signature:{arguments:[{type:{name:`signature`,type:`object`,raw:`{ id: string; [key: string]: unknown }`,signature:{properties:[{key:`id`,value:{name:`string`,required:!0}},{key:{name:`string`},value:{name:`unknown`,required:!0}}]}},name:`row`}],return:{name:`ReactNode`}},required:!1}}]}}],raw:`TableColumn[]`},description:"Column definitions in display order. `header` is the visible heading; `align: end` for numbers; `sortable` adds the sort button; exactly one column may be `isRowHeader`; `hideBelow` drops a column below a layout width; `render` formats the cell."},data:{required:!0,tsType:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{ id: string; [key: string]: unknown }`,signature:{properties:[{key:`id`,value:{name:`string`,required:!0}},{key:{name:`string`},value:{name:`unknown`,required:!0}}]}}],raw:`TableRow[]`},description:"The rows. `id` must be stable; it is what selection and keys use."},sort:{required:!1,tsType:{name:`union`,raw:`TableSortState | undefined`,elements:[{name:`signature`,type:`object`,raw:`{ column: string; direction: TableSortDirection }`,signature:{properties:[{key:`column`,value:{name:`string`,required:!0}},{key:`direction`,value:{name:`union`,raw:`'ascending' | 'descending'`,elements:[{name:`literal`,value:`'ascending'`},{name:`literal`,value:`'descending'`}],required:!0}}]}},{name:`undefined`}]},description:`Controlled sort state. The table shows it; the caller sorts the data (so server-side sorting works the same way).`},defaultSort:{required:!1,tsType:{name:`union`,raw:`TableSortState | undefined`,elements:[{name:`signature`,type:`object`,raw:`{ column: string; direction: TableSortDirection }`,signature:{properties:[{key:`column`,value:{name:`string`,required:!0}},{key:`direction`,value:{name:`union`,raw:`'ascending' | 'descending'`,elements:[{name:`literal`,value:`'ascending'`},{name:`literal`,value:`'descending'`}],required:!0}}]}},{name:`undefined`}]},description:"Initial sort for uncontrolled use; the table then sorts `data` itself by the column value (localeCompare for strings, numeric otherwise)."},selectable:{required:!1,tsType:{name:`union`,raw:`TableSelectable | undefined`,elements:[{name:`union`,raw:`'none' | 'single' | 'multiple'`,elements:[{name:`literal`,value:`'none'`},{name:`literal`,value:`'single'`},{name:`literal`,value:`'multiple'`}]},{name:`undefined`}]},description:"Adds a first column of Checkboxes (radio-like behavior for `single`) and a select-all in the header for `multiple`.",defaultValue:{value:`'none'`,computed:!1}},selected:{required:!1,tsType:{name:`union`,raw:`string[] | undefined`,elements:[{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`undefined`}]},description:`Controlled selected row ids.`},defaultSelected:{required:!1,tsType:{name:`union`,raw:`string[] | undefined`,elements:[{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`undefined`}]},description:`Initially selected ids.`},responsive:{required:!1,tsType:{name:`union`,raw:`TableResponsive | undefined`,elements:[{name:`union`,raw:`'stack' | 'scroll'`,elements:[{name:`literal`,value:`'stack'`},{name:`literal`,value:`'scroll'`}]},{name:`undefined`}]},description:"Below `layout.maxWidth.prose`: `stack` turns each row into a labelled block; `scroll` keeps the columns and scrolls horizontally inside a labelled region with the row-header column sticky.",defaultValue:{value:`'stack'`,computed:!1}},stickyHeader:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"The header row stays visible while the body scrolls (the page, or `maxHeight`).",defaultValue:{value:`true`,computed:!1}},maxHeight:{required:!1,tsType:{name:`union`,raw:`TableMaxHeight | undefined`,elements:[{name:`union`,raw:`'none' | 'viewport'`,elements:[{name:`literal`,value:`'none'`},{name:`literal`,value:`'viewport'`}]},{name:`undefined`}]},description:"`viewport` caps the table at the viewport height minus two `layout.gap.section` and scrolls a frame around the table (the scroll region itself in `responsive: scroll`); `none` lets the page scroll.",defaultValue:{value:`'none'`,computed:!1}},density:{required:!1,tsType:{name:`union`,raw:`TableDensity | undefined`,elements:[{name:`union`,raw:`'compact' | 'comfortable'`,elements:[{name:`literal`,value:`'compact'`},{name:`literal`,value:`'comfortable'`}]},{name:`undefined`}]},description:`Cell padding: layout.inset.sm or layout.inset.md.`,defaultValue:{value:`'comfortable'`,computed:!1}},striped:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Alternate row backgrounds. Useful past about eight columns; borders are the default row separator.`,defaultValue:{value:`false`,computed:!1}},emptyMessage:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:"Shown in place of the body when `data` is empty. Defaults to `copy.empty`."},loading:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"Data is being fetched: aria-busy is set on the table and `copy.loading` shows — with no rows, in the emptyState; with rows, as muted Text in a polite live region below the table. Existing rows stay visible while re-sorting.",defaultValue:{value:`false`,computed:!1}},rowActions:{required:!1,tsType:{name:`union`,raw:`((row: TableRow) => ReactNode) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Renders a trailing actions cell: Buttons (ghost, sm, iconOnly with Tooltip) or a Menu.`},overrides:{required:!1,tsType:{name:`union`,raw:`TableOverrides | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'headerWeight'
| 'headerSize'
| 'headerBorder'
| 'headerBorderWidth'
| 'headerShadow'
| 'rowBorder'
| 'rowBorderWidth'
| 'rowHover'
| 'cellPaddingInline'
| 'cellPaddingBlock'
| 'cellGap'
| 'captionSize'
| 'captionWeight'
| 'captionGap'
| 'stackedRowInset'
| 'stackedRowGap'
| 'stackedBlockGap'
| 'stackedLabelSize'
| 'stackedLabelWeight'
| 'stackedRowRadius'
| 'stickyColumnShadow'
| 'scrollFade'
| 'fontFamily'
| 'fontSize'
| 'lineHeight'
| 'numericFont'
| 'transition'`,elements:[{name:`literal`,value:`'headerWeight'`},{name:`literal`,value:`'headerSize'`},{name:`literal`,value:`'headerBorder'`},{name:`literal`,value:`'headerBorderWidth'`},{name:`literal`,value:`'headerShadow'`},{name:`literal`,value:`'rowBorder'`},{name:`literal`,value:`'rowBorderWidth'`},{name:`literal`,value:`'rowHover'`},{name:`literal`,value:`'cellPaddingInline'`},{name:`literal`,value:`'cellPaddingBlock'`},{name:`literal`,value:`'cellGap'`},{name:`literal`,value:`'captionSize'`},{name:`literal`,value:`'captionWeight'`},{name:`literal`,value:`'captionGap'`},{name:`literal`,value:`'stackedRowInset'`},{name:`literal`,value:`'stackedRowGap'`},{name:`literal`,value:`'stackedBlockGap'`},{name:`literal`,value:`'stackedLabelSize'`},{name:`literal`,value:`'stackedLabelWeight'`},{name:`literal`,value:`'stackedRowRadius'`},{name:`literal`,value:`'stickyColumnShadow'`},{name:`literal`,value:`'scrollFade'`},{name:`literal`,value:`'fontFamily'`},{name:`literal`,value:`'fontSize'`},{name:`literal`,value:`'lineHeight'`},{name:`literal`,value:`'numericFont'`},{name:`literal`,value:`'transition'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<TableOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<TableOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:`Per-instance style overrides: each entry sets the matching CSS hook to that token, inline.`},onSortChange:{required:!1,tsType:{name:`union`,raw:`((column: string, direction: TableSortDirection) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired when a sortable header is activated (ascending → descending on the same column, ascending on a new one).`},onSelectionChange:{required:!1,tsType:{name:`union`,raw:`((selected: string[]) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired with the new array of selected ids.`},onRowPress:{required:!1,tsType:{name:`union`,raw:`((id: string) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired when a row is activated, with its id. The row-header cell becomes a Button and the row is styled interactive.`},ref:{required:!1,tsType:{name:`union`,raw:`Ref<HTMLDivElement> | undefined`,elements:[{name:`Ref`,elements:[{name:`HTMLDivElement`}],raw:`Ref<HTMLDivElement>`},{name:`undefined`}]},description:``}},composes:[`Omit`]}})))()}var b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function le(){return(le=e((()=>{y(),a(),te(),u(),c(),b=n(),x={title:`Table/React`,component:m,tags:[`autodocs`],args:{caption:`Open invoices`,columns:[{key:`invoice`,header:`Invoice`,isRowHeader:!0},{key:`due`,header:`Due`},{key:`amount`,header:`Amount`,align:`end`,sortable:!0}],data:[{id:`a`,invoice:`INV-1`,due:`12 Sep`,amount:100},{id:`b`,invoice:`INV-2`,due:`19 Sep`,amount:200}]}},S={},C={args:{captionLevel:`2`}},w={args:{captionLevel:`3`}},T={args:{captionLevel:`4`}},E={args:{selectable:`none`}},D={args:{selectable:`single`}},O={args:{selectable:`multiple`}},k={args:{responsive:`stack`}},A={args:{responsive:`scroll`}},j={args:{maxHeight:`none`}},M={args:{maxHeight:`viewport`}},N={args:{density:`compact`}},P={args:{density:`comfortable`}},F={args:{caption:`Open invoices`,columns:[{key:`invoice`,header:`Invoice`,isRowHeader:!0},{key:`due`,header:`Due`},{key:`amount`,header:`Amount`,align:`end`,sortable:!0}],data:[{id:`a`,invoice:`INV-1`,due:`12 Sep`,amount:100},{id:`b`,invoice:`INV-2`,due:`19 Sep`,amount:200}]}},I={args:{caption:`Members`,selectable:`multiple`,defaultSelected:[`a`],columns:[{key:`person`,header:`Person`,isRowHeader:!0},{key:`role`,header:`Role`}],data:[{id:`a`,person:`Ana Souza`,role:`Admin`},{id:`b`,person:`Bo Lin`,role:`Editor`}]}},L={args:{caption:`Daily traffic`,responsive:`scroll`,density:`compact`,maxHeight:`viewport`,columns:[{key:`day`,header:`Day`,isRowHeader:!0},{key:`visits`,header:`Visits`,align:`end`},{key:`signups`,header:`Signups`,align:`end`}],data:[{id:`a`,day:`Monday`,visits:1200,signups:30},{id:`b`,day:`Tuesday`,visits:1450,signups:41}]}},R={args:{caption:`Open invoices`,emptyMessage:`No invoices yet.`,columns:[{key:`invoice`,header:`Invoice`,isRowHeader:!0}],data:[]}},z={args:{hideCaption:!0}},B={args:{stickyHeader:!1}},V={args:{striped:!0}},H={args:{data:[]}},U={args:{loading:!0}},W={args:{loading:!0,data:[]}},G={args:{defaultSort:{column:`amount`,direction:`descending`}}},K={args:{columns:[{key:`invoice`,header:`Invoice`,isRowHeader:!0,render:e=>(0,b.jsx)(d,{href:`#${e.id}`,label:String(e.invoice)})},{key:`due`,header:`Due`,hideBelow:`prose`},{key:`amount`,header:`Amount`,align:`end`,sortable:!0}]}},q={args:{onRowPress:()=>void 0}},J={args:{rowActions:e=>(0,b.jsx)(o,{variant:`ghost`,size:`sm`,iconOnly:!0,label:`More for ${String(e.invoice)}`,leadingIcon:(0,b.jsx)(ne,{name:`ellipsis`})})}},Y={args:{footer:`Total due: 300`}},X={args:{footer:(0,b.jsx)(l,{element:`p`,size:`sm`,tone:`muted`,children:`2 rows`})}},Z={args:{selectable:`multiple`}},Q=`Default.CaptionLevel2.CaptionLevel3.CaptionLevel4.SelectableNone.SelectableSingle.SelectableMultiple.ResponsiveStack.ResponsiveScroll.MaxHeightNone.MaxHeightViewport.DensityCompact.DensityComfortable.OpenInvoices.SelectableRows.DenseDataTableThatScrolls.NothingToShow.HideCaption.NoStickyHeader.Striped.Empty.Loading.LoadingEmpty.DefaultSortDescending.LinkInRowHeader.InteractiveRows.WithRowActions.WithFooter.WithFooterContent.Keyboard`.split(`.`),S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '2'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '3'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '4'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'none'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'single'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'multiple'
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    responsive: 'stack'
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    responsive: 'scroll'
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    maxHeight: 'none'
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    maxHeight: 'viewport'
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    density: 'compact'
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    density: 'comfortable'
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    caption: 'Open invoices',
    columns: [{
      key: 'invoice',
      header: 'Invoice',
      isRowHeader: true
    }, {
      key: 'due',
      header: 'Due'
    }, {
      key: 'amount',
      header: 'Amount',
      align: 'end',
      sortable: true
    }],
    data: [{
      id: 'a',
      invoice: 'INV-1',
      due: '12 Sep',
      amount: 100
    }, {
      id: 'b',
      invoice: 'INV-2',
      due: '19 Sep',
      amount: 200
    }]
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    caption: 'Members',
    selectable: 'multiple',
    defaultSelected: ['a'],
    columns: [{
      key: 'person',
      header: 'Person',
      isRowHeader: true
    }, {
      key: 'role',
      header: 'Role'
    }],
    data: [{
      id: 'a',
      person: 'Ana Souza',
      role: 'Admin'
    }, {
      id: 'b',
      person: 'Bo Lin',
      role: 'Editor'
    }]
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    caption: 'Daily traffic',
    responsive: 'scroll',
    density: 'compact',
    maxHeight: 'viewport',
    columns: [{
      key: 'day',
      header: 'Day',
      isRowHeader: true
    }, {
      key: 'visits',
      header: 'Visits',
      align: 'end'
    }, {
      key: 'signups',
      header: 'Signups',
      align: 'end'
    }],
    data: [{
      id: 'a',
      day: 'Monday',
      visits: 1200,
      signups: 30
    }, {
      id: 'b',
      day: 'Tuesday',
      visits: 1450,
      signups: 41
    }]
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    caption: 'Open invoices',
    emptyMessage: 'No invoices yet.',
    columns: [{
      key: 'invoice',
      header: 'Invoice',
      isRowHeader: true
    }],
    data: []
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    hideCaption: true
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    stickyHeader: false
  }
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    striped: true
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    data: []
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true,
    data: []
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  args: {
    defaultSort: {
      column: 'amount',
      direction: 'descending'
    }
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  args: {
    columns: [{
      key: 'invoice',
      header: 'Invoice',
      isRowHeader: true,
      render: row => <Link href={\`#\${row.id}\`} label={String(row['invoice'])} />
    }, {
      key: 'due',
      header: 'Due',
      hideBelow: 'prose'
    }, {
      key: 'amount',
      header: 'Amount',
      align: 'end',
      sortable: true
    }]
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    onRowPress: () => undefined
  }
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  args: {
    rowActions: row => <Button variant="ghost" size="sm" iconOnly label={\`More for \${String(row['invoice'])}\`} leadingIcon={<Icon name="ellipsis" />} />
  }
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  args: {
    footer: 'Total due: 300'
  }
}`,...Y.parameters?.docs?.source},description:{story:`A string footer renders in Text with the table's font bindings.`,...Y.parameters?.docs?.description}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  args: {
    footer: <Text element="p" size="sm" tone="muted">\r
        2 rows\r
      </Text>
  }
}`,...X.parameters?.docs?.source},description:{story:`Other footer content brings its own typography.`,...X.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'multiple'
  }
}`,...Z.parameters?.docs?.source},description:{story:`Present with more than three focusable children: select-all, a sort button, and a Checkbox per row.`,...Z.parameters?.docs?.description}}}})))()}le();export{C as CaptionLevel2,w as CaptionLevel3,T as CaptionLevel4,S as Default,G as DefaultSortDescending,L as DenseDataTableThatScrolls,P as DensityComfortable,N as DensityCompact,H as Empty,z as HideCaption,q as InteractiveRows,Z as Keyboard,K as LinkInRowHeader,U as Loading,W as LoadingEmpty,j as MaxHeightNone,M as MaxHeightViewport,B as NoStickyHeader,R as NothingToShow,F as OpenInvoices,A as ResponsiveScroll,k as ResponsiveStack,O as SelectableMultiple,E as SelectableNone,I as SelectableRows,D as SelectableSingle,V as Striped,Y as WithFooter,X as WithFooterContent,J as WithRowActions,Q as __namedExportsOrder,x as default};