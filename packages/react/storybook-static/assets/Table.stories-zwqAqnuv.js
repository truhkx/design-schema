import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t}from"./iframe-CeSprNHO.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./names-szlHjJ4U.js";import{n as a,t as o}from"./Button-Dwx7L93c.js";import{n as s,t as ee}from"./Heading-mMt-zxmQ.js";import{n as c,t as l}from"./Text-BmznDQS2.js";import{n as u,t as te}from"./Icon-CDe7Poew.js";import{n as d,t as f}from"./Link-crBuztkb.js";import{n as ne,t as re}from"./Checkbox-CbaGVFBy.js";function ie(e){let t={};for(let n of Object.keys(e)){let r=y[n],a=e[n];r&&a&&(t[r]=i(a))}return t}function ae(e,t){return e==null?t==null?0:1:t==null?-1:typeof e==`number`&&typeof t==`number`?e-t:String(e).localeCompare(String(t),void 0,{numeric:!0})}function p(e){return e==null?``:String(e)}function m(...e){return e.filter(Boolean).join(` `)}function oe(){return typeof document<`u`&&document.documentElement.lang?document.documentElement.lang:void 0}function h({ref:e,caption:t,captionLevel:n=`2`,footer:r,hideCaption:i=!1,columns:a,data:s,sort:c,defaultSort:u,selectable:d=`none`,selected:f,defaultSelected:ne,responsive:h=`stack`,stickyHeader:y=!0,maxHeight:b=`none`,density:x=`comfortable`,striped:S=!1,emptyMessage:C,loading:w=!1,rowActions:T,overrides:E,onSortChange:D,onSelectionChange:O,onRowPress:k,...A}){let j=(0,g.useId)(),M=`${j}-caption`,N=`${j}-row-count`,P=`${j}-scroll-hint`,F=(0,g.useRef)(null);(0,g.useImperativeHandle)(e,()=>F.current,[]);let I=(0,g.useRef)(null),L=(0,g.useRef)(null),R=a.find(e=>e.isRowHeader);a.filter(e=>e.isRowHeader).length;let z=!!(k&&R&&!R.render),[B,V]=(0,g.useState)(u),H=c!==void 0,U=H?c:B,W=(0,g.useMemo)(()=>{if(H||!U)return s;let e=U.direction===`ascending`?1:-1;return[...s].sort((t,n)=>ae(t[U.column],n[U.column])*e)},[s,H,U]),[G,K]=(0,g.useState)(``),q=e=>{let t=U?.column===e.key&&U.direction===`ascending`?`descending`:`ascending`;H||V({column:e.key,direction:t}),D?.(e.key,t),K(v.sortedAnnouncement.replace(`{column}`,e.header).replace(`{direction}`,t))},[J,Y]=(0,g.useState)(ne??[]),X=f!==void 0,Z=X?f:J,Q=new Set(Z),$=e=>{X||Y(e),O?.(e),K(v.selectedCount.replace(`{count}`,String(e.length)).replace(`{total}`,String(s.length)))},se=(e,t)=>{$(d===`single`?t?[e]:[]:t?[...Z.filter(t=>t!==e),e]:Z.filter(t=>t!==e))},ce=s.length>0&&s.every(e=>Q.has(e.id)),le=!ce&&s.some(e=>Q.has(e.id)),ue=()=>$(ce?[]:s.map(e=>e.id)),de=y&&(h!==`scroll`||b===`viewport`),[fe,pe]=(0,g.useState)(!1);(0,g.useEffect)(()=>{let e=L.current;if(!de||!e||typeof IntersectionObserver>`u`){pe(!1);return}let t=new IntersectionObserver(e=>{let t=e[e.length-1];if(!t)return;let n=t.rootBounds?.top??0,r=!t.isIntersecting&&t.boundingClientRect.top<n;pe(e=>e===r?e:r)},{root:b===`viewport`?I.current:null});return t.observe(e),()=>t.disconnect()},[de,b,h]);let[me,he]=(0,g.useState)(!1),[ge,_e]=(0,g.useState)(!1),ve=e=>{let t=e.scrollWidth-e.clientWidth,n=Math.abs(e.scrollLeft),r=n>0,i=t-n>=1;he(e=>e===r?e:r),_e(e=>e===i?e:i)},ye=e=>ve(e.currentTarget);(0,g.useEffect)(()=>{let e=I.current;if(h!==`scroll`||!e||typeof ResizeObserver>`u`)return;let t=new ResizeObserver(()=>ve(e));t.observe(e);let n=e.querySelector(`table`);return n&&t.observe(n),()=>t.disconnect()},[h]);let be=e=>{if(e.target!==e.currentTarget||e.key!==`ArrowRight`&&e.key!==`ArrowLeft`)return;let t=e.currentTarget,n=parseFloat(getComputedStyle(t).getPropertyValue(`--space-10`));Number.isFinite(n)&&(e.preventDefault(),t.scrollBy({left:e.key===`ArrowRight`?n:-n}))},xe=(e,t)=>{if(!z)return;let n=e.target.closest(`button, a, input, select, textarea, label, [tabindex]`);n&&e.currentTarget.contains(n)||k?.(t)},Se=(d===`none`?0:1)+a.length+ +!!T,Ce=new Intl.PluralRules(oe()).select(s.length)===`one`?`one`:`other`,we=v.rowCount[Ce].replace(`{count}`,String(s.length)),Te=(e,t)=>m(e,t.align&&t.align!==`start`&&`ds-table__cell--align-${t.align}`,t.width&&t.width!==`auto`&&`ds-table__cell--width-${t.width}`,t.hideBelow&&`ds-table__cell--hide-below-${t.hideBelow}`,t.isRowHeader&&`ds-table__cell--row-header`),Ee=(0,_.jsxs)(`table`,{role:`table`,"aria-labelledby":M,"aria-describedby":N,"aria-rowcount":s.length+1,"aria-colcount":Se,"aria-busy":w?!0:void 0,"data-part":`table`,className:`ds-table__table`,children:[(0,_.jsx)(`thead`,{role:`rowgroup`,"data-part":`header`,className:`ds-table__header`,children:(0,_.jsxs)(`tr`,{role:`row`,"data-part":`headerRow`,className:`ds-table__header-row`,children:[d===`multiple`?(0,_.jsx)(`th`,{role:`columnheader`,scope:`col`,"data-part":`selectAllCell`,className:`ds-table__select`,children:(0,_.jsx)(re,{label:v.selectAll,hideLabel:!0,name:`${j}-select-all`,checked:ce,indeterminate:le,onChange:ue})}):d===`single`?(0,_.jsx)(`td`,{role:`cell`,className:`ds-table__select`}):null,a.map(e=>{let t=U?.column===e.key?U.direction:void 0,n=t===`ascending`?`descending`:`ascending`;return(0,_.jsx)(`th`,{role:`columnheader`,scope:`col`,abbr:e.abbr,"aria-sort":t,"data-part":`columnHeader`,className:Te(`ds-table__column-header`,e),children:e.sortable?(0,_.jsx)(o,{variant:`ghost`,size:`sm`,label:e.header,accessibleName:(n===`ascending`?v.sortAscending:v.sortDescending).replace(`{column}`,e.header),trailingIcon:t?(0,_.jsx)(te,{name:t===`ascending`?`chevron-up`:`chevron-down`,inline:!0}):void 0,overrides:{fontWeight:E?.headerWeight??`font.weight.semibold`,iconGap:E?.cellGap??`layout.gap.tight`},onClick:()=>q(e)}):e.header},e.key)}),T?(0,_.jsx)(`th`,{role:`columnheader`,scope:`col`,"data-part":`columnHeader`,className:`ds-table__column-header`,children:(0,_.jsx)(`span`,{className:`ds-table__visually-hidden`,children:v.actions})}):null]})}),(0,_.jsx)(`tbody`,{role:`rowgroup`,"data-part":`body`,className:`ds-table__body`,children:W.length===0?(0,_.jsx)(`tr`,{role:`row`,className:`ds-table__row ds-table__row--empty`,children:(0,_.jsx)(`td`,{role:`cell`,colSpan:Se,className:`ds-table__empty`,children:(0,_.jsx)(l,{element:`p`,tone:`muted`,"data-part":`emptyState`,children:w?v.loading:C??v.empty})})}):W.map(e=>{let t=Q.has(e.id),n=R&&p(e[R.key])||e.id;return(0,_.jsxs)(`tr`,{role:`row`,"aria-selected":d===`none`?void 0:t,"data-part":`row`,className:m(`ds-table__row`,t&&`ds-table__row--selected`,z&&`ds-table__row--interactive`),onClick:z?t=>xe(t,e.id):void 0,children:[d===`none`?null:(0,_.jsx)(`td`,{role:`cell`,"data-part":`selectCell`,className:`ds-table__select`,children:(0,_.jsx)(re,{label:v.selectRow.replace(`{rowName}`,n),hideLabel:!0,name:`${j}-select`,value:e.id,checked:t,onChange:t=>se(e.id,t)})}),a.map(t=>t===R?(0,_.jsx)(`th`,{role:`rowheader`,scope:`row`,"data-part":`rowHeader`,className:Te(`ds-table__row-header`,t),children:z?(0,_.jsx)(o,{variant:`ghost`,size:`sm`,label:n,onClick:()=>k?.(e.id)}):t.render?t.render(e):p(e[t.key])},t.key):(0,_.jsx)(`td`,{role:`cell`,"data-part":`cell`,"data-label":t.header,className:Te(`ds-table__cell`,t),children:t.render?t.render(e):p(e[t.key])},t.key)),T?(0,_.jsx)(`td`,{role:`cell`,"data-part":`cell`,"data-label":v.actions,className:`ds-table__cell ds-table__cell--actions`,children:(0,_.jsx)(`div`,{className:`ds-table__actions`,children:T(e)})}):null]},e.id)})})]}),De=m(`ds-table__frame`,me&&`ds-table__frame--scrolled`),Oe=(0,_.jsx)(`div`,{ref:L,"aria-hidden":`true`,className:`ds-table__sentinel`});return(0,_.jsxs)(`div`,{...A,ref:F,"data-ds":`Table`,"data-part":`container`,className:m(`ds-table`,`ds-table--${h}`,`ds-table--${x}`,`ds-table--max-height-${b}`,y&&`ds-table--sticky-header`,S&&`ds-table--striped`,fe&&`ds-table--scrolled-under`),style:E?ie(E):void 0,children:[(0,_.jsx)(`div`,{"data-part":`caption`,className:m(`ds-table__caption`,i&&`ds-table__visually-hidden`),children:(0,_.jsx)(ee,{id:M,level:n,size:`md`,overrides:{fontSize:E?.captionSize??`font.size.md`,fontWeight:E?.captionWeight??`font.weight.semibold`,marginBlockEnd:i?`space.0`:E?.captionGap??`space.2`},children:t})}),(0,_.jsx)(`span`,{id:N,className:`ds-table__visually-hidden`,children:we}),h===`scroll`?(0,_.jsxs)(`div`,{ref:I,role:`region`,"aria-labelledby":M,"aria-describedby":P,tabIndex:0,"data-part":`scrollRegion`,className:m(De,`ds-table__scroll-region`,me&&`ds-table__scroll-region--fade-start`,ge&&`ds-table__scroll-region--fade-end`),onScroll:ye,onKeyDown:be,children:[Oe,Ee]}):(0,_.jsxs)(`div`,{ref:I,className:De,children:[Oe,Ee]}),h===`scroll`?(0,_.jsx)(`span`,{id:P,className:`ds-table__visually-hidden`,children:v.scrollHint}):null,(0,_.jsx)(`div`,{"aria-live":`polite`,className:`ds-table__loading`,children:w&&W.length>0?(0,_.jsx)(l,{element:`p`,tone:`muted`,size:`sm`,children:v.loading}):null}),r!=null&&r!==!1?(0,_.jsx)(`div`,{"data-part":`footer`,className:`ds-table__footer`,children:typeof r==`string`?(0,_.jsx)(l,{element:`p`,overrides:{fontFamily:E?.fontFamily??`font.family.body`,fontSize:E?.fontSize??`font.size.sm`,lineHeight:E?.lineHeight??`font.lineHeight.normal`},children:r}):r}):null,(0,_.jsx)(`div`,{role:`status`,"aria-live":`polite`,className:`ds-table__visually-hidden`,children:G})]})}var g,_,v,y;function b(){return(b=e((()=>{g=t(),r(),a(),ne(),s(),u(),c(),_=n(),v={sortAscending:`Sort by {column}, ascending`,sortDescending:`Sort by {column}, descending`,sortedAnnouncement:`Sorted by {column}, {direction}`,selectAll:`Select all rows`,selectRow:`Select {rowName}`,selectedCount:`{count} of {total} selected`,actions:`Actions`,empty:`Nothing to show.`,loading:`Loading`,scrollHint:`Scroll sideways to see more columns`,rowCount:{one:`{count} row`,other:`{count} rows`}},y={headerWeight:`--ds-table-header-weight`,headerSize:`--ds-table-header-size`,headerBorder:`--ds-table-header-border`,headerBorderWidth:`--ds-table-header-border-width`,headerShadow:`--ds-table-header-shadow`,rowBorder:`--ds-table-row-border`,rowBorderWidth:`--ds-table-row-border-width`,rowHover:`--ds-table-row-hover`,cellPaddingInline:`--ds-table-cell-padding-inline`,cellPaddingBlock:`--ds-table-cell-padding-block`,cellGap:`--ds-table-cell-gap`,stackedRowInset:`--ds-table-stacked-row-inset`,stackedRowGap:`--ds-table-stacked-row-gap`,stackedBlockGap:`--ds-table-stacked-block-gap`,stackedLabelSize:`--ds-table-stacked-label-size`,stackedLabelWeight:`--ds-table-stacked-label-weight`,stackedRowRadius:`--ds-table-stacked-row-radius`,stickyColumnShadow:`--ds-table-sticky-column-shadow`,scrollFade:`--ds-table-scroll-fade`,fontFamily:`--ds-table-font-family`,fontSize:`--ds-table-font-size`,lineHeight:`--ds-table-line-height`,numericFont:`--ds-table-numeric-font`,transition:`--ds-table-transition`},h.__docgenInfo={description:"Table — Design Schema, category: data.\n\nWhen to use:\nUse a Table for a list of records with three or more comparable fields: orders, invoices, members, inventory, results. Use `stack` (the default) when each row is a thing a person reads — a person, an order — and `scroll` when the columns are what matters — figures across months, a comparison. Add `sortable` to columns people compare by; `selectable: multiple` when bulk actions exist (put them in a Toolbar above the table that appears with the selection count). Put the row's identity in the `isRowHeader` column, usually as a Link to its detail page.",methods:[],displayName:`Table`,props:{caption:{required:!0,tsType:{name:`string`},description:'What the table lists ("Open invoices"). Rendered as the caption and the accessible name; visually hidden with `hideCaption` when a Heading directly above already says it.'},captionLevel:{required:!1,tsType:{name:`union`,raw:`TableCaptionLevel | undefined`,elements:[{name:`union`,raw:`'2' | '3' | '4' | 2 | 3 | 4`,elements:[{name:`literal`,value:`'2'`},{name:`literal`,value:`'3'`},{name:`literal`,value:`'4'`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`}]},{name:`undefined`}]},description:`Heading level of the caption in the page outline; its size is captionSize regardless.`,defaultValue:{value:`'2'`,computed:!1}},footer:{required:!1,tsType:{name:`ReactNode`},description:"Content below the table: a row count, pagination, a total. Rendered in the `footer` part with the table's font: a string footer renders in Text with the `fontFamily`/`fontSize`/`lineHeight` bindings; other content brings its own typography."},hideCaption:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Visually hide the caption; it remains the accessible name.`,defaultValue:{value:`false`,computed:!1}},columns:{required:!0,tsType:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{
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
| 'transition'`,elements:[{name:`literal`,value:`'headerWeight'`},{name:`literal`,value:`'headerSize'`},{name:`literal`,value:`'headerBorder'`},{name:`literal`,value:`'headerBorderWidth'`},{name:`literal`,value:`'headerShadow'`},{name:`literal`,value:`'rowBorder'`},{name:`literal`,value:`'rowBorderWidth'`},{name:`literal`,value:`'rowHover'`},{name:`literal`,value:`'cellPaddingInline'`},{name:`literal`,value:`'cellPaddingBlock'`},{name:`literal`,value:`'cellGap'`},{name:`literal`,value:`'captionSize'`},{name:`literal`,value:`'captionWeight'`},{name:`literal`,value:`'captionGap'`},{name:`literal`,value:`'stackedRowInset'`},{name:`literal`,value:`'stackedRowGap'`},{name:`literal`,value:`'stackedBlockGap'`},{name:`literal`,value:`'stackedLabelSize'`},{name:`literal`,value:`'stackedLabelWeight'`},{name:`literal`,value:`'stackedRowRadius'`},{name:`literal`,value:`'stickyColumnShadow'`},{name:`literal`,value:`'scrollFade'`},{name:`literal`,value:`'fontFamily'`},{name:`literal`,value:`'fontSize'`},{name:`literal`,value:`'lineHeight'`},{name:`literal`,value:`'numericFont'`},{name:`literal`,value:`'transition'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<TableOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<TableOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:`Per-instance style overrides: each entry sets the matching CSS hook to that token, inline.`},onSortChange:{required:!1,tsType:{name:`union`,raw:`((column: string, direction: TableSortDirection) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired when a sortable header is activated (ascending → descending on the same column, ascending on a new one).`},onSelectionChange:{required:!1,tsType:{name:`union`,raw:`((selected: string[]) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired with the new array of selected ids.`},onRowPress:{required:!1,tsType:{name:`union`,raw:`((id: string) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired when a row is activated, with its id. The row-header cell becomes a Button and the row is styled interactive.`},ref:{required:!1,tsType:{name:`union`,raw:`Ref<HTMLDivElement> | undefined`,elements:[{name:`Ref`,elements:[{name:`HTMLDivElement`}],raw:`Ref<HTMLDivElement>`},{name:`undefined`}]},description:``}},composes:[`Omit`]}})))()}var x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,$;function se(){return(se=e((()=>{b(),a(),u(),d(),c(),x=n(),S={title:`Table/React`,component:h,tags:[`autodocs`],args:{caption:`Open invoices`,columns:[{key:`invoice`,header:`Invoice`,isRowHeader:!0},{key:`due`,header:`Due`},{key:`amount`,header:`Amount`,align:`end`,sortable:!0}],data:[{id:`a`,invoice:`INV-1`,due:`12 Sep`,amount:100},{id:`b`,invoice:`INV-2`,due:`19 Sep`,amount:200}]}},C={},w={args:{captionLevel:`2`}},T={args:{captionLevel:`3`}},E={args:{captionLevel:`4`}},D={args:{selectable:`none`}},O={args:{selectable:`single`}},k={args:{selectable:`multiple`}},A={args:{responsive:`stack`}},j={args:{responsive:`scroll`}},M={args:{maxHeight:`none`}},N={args:{maxHeight:`viewport`}},P={args:{density:`compact`}},F={args:{density:`comfortable`}},I={args:{caption:`Open invoices`,columns:[{key:`invoice`,header:`Invoice`,isRowHeader:!0},{key:`due`,header:`Due`},{key:`amount`,header:`Amount`,align:`end`,sortable:!0}],data:[{id:`a`,invoice:`INV-1`,due:`12 Sep`,amount:100},{id:`b`,invoice:`INV-2`,due:`19 Sep`,amount:200}]}},L={args:{caption:`Members`,selectable:`multiple`,defaultSelected:[`a`],columns:[{key:`person`,header:`Person`,isRowHeader:!0},{key:`role`,header:`Role`}],data:[{id:`a`,person:`Ana Souza`,role:`Admin`},{id:`b`,person:`Bo Lin`,role:`Editor`}]}},R={args:{caption:`Daily traffic`,responsive:`scroll`,density:`compact`,maxHeight:`viewport`,columns:[{key:`day`,header:`Day`,isRowHeader:!0},{key:`visits`,header:`Visits`,align:`end`},{key:`signups`,header:`Signups`,align:`end`}],data:[{id:`a`,day:`Monday`,visits:1200,signups:30},{id:`b`,day:`Tuesday`,visits:1450,signups:41}]}},z={args:{caption:`Open invoices`,emptyMessage:`No invoices yet.`,columns:[{key:`invoice`,header:`Invoice`,isRowHeader:!0}],data:[]}},B={args:{hideCaption:!0}},V={args:{stickyHeader:!1}},H={args:{striped:!0}},U={args:{data:[]}},W={args:{loading:!0}},G={args:{loading:!0,data:[]}},K={args:{defaultSort:{column:`amount`,direction:`descending`}}},q={args:{columns:[{key:`invoice`,header:`Invoice`,isRowHeader:!0,render:e=>(0,x.jsx)(f,{href:`#${e.id}`,label:String(e.invoice)})},{key:`due`,header:`Due`,hideBelow:`prose`},{key:`amount`,header:`Amount`,align:`end`,sortable:!0}]}},J={args:{onRowPress:()=>void 0}},Y={args:{rowActions:e=>(0,x.jsx)(o,{variant:`ghost`,size:`sm`,iconOnly:!0,label:`More for ${String(e.invoice)}`,leadingIcon:(0,x.jsx)(te,{name:`ellipsis`})})}},X={args:{footer:`Total due: 300`}},Z={args:{footer:(0,x.jsx)(l,{element:`p`,size:`sm`,tone:`muted`,children:`2 rows`})}},Q={args:{selectable:`multiple`}},$=`Default.CaptionLevel2.CaptionLevel3.CaptionLevel4.SelectableNone.SelectableSingle.SelectableMultiple.ResponsiveStack.ResponsiveScroll.MaxHeightNone.MaxHeightViewport.DensityCompact.DensityComfortable.OpenInvoices.SelectableRows.DenseDataTableThatScrolls.NothingToShow.HideCaption.NoStickyHeader.Striped.Empty.Loading.LoadingEmpty.DefaultSortDescending.LinkInRowHeader.InteractiveRows.WithRowActions.WithFooter.WithFooterContent.Keyboard`.split(`.`),C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '2'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '3'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '4'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'none'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'single'
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'multiple'
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    responsive: 'stack'
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    responsive: 'scroll'
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    maxHeight: 'none'
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    maxHeight: 'viewport'
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    density: 'compact'
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    density: 'comfortable'
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    hideCaption: true
  }
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    stickyHeader: false
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    striped: true
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    data: []
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true,
    data: []
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  args: {
    defaultSort: {
      column: 'amount',
      direction: 'descending'
    }
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
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
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  args: {
    onRowPress: () => undefined
  }
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  args: {
    rowActions: row => <Button variant="ghost" size="sm" iconOnly label={\`More for \${String(row['invoice'])}\`} leadingIcon={<Icon name="ellipsis" />} />
  }
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  args: {
    footer: 'Total due: 300'
  }
}`,...X.parameters?.docs?.source},description:{story:`A string footer renders in Text with the table's font bindings.`,...X.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  args: {
    footer: <Text element="p" size="sm" tone="muted">\r
        2 rows\r
      </Text>
  }
}`,...Z.parameters?.docs?.source},description:{story:`Other footer content brings its own typography.`,...Z.parameters?.docs?.description}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'multiple'
  }
}`,...Q.parameters?.docs?.source},description:{story:`Present with more than three focusable children: select-all, a sort button, and a Checkbox per row.`,...Q.parameters?.docs?.description}}}})))()}se();export{w as CaptionLevel2,T as CaptionLevel3,E as CaptionLevel4,C as Default,K as DefaultSortDescending,R as DenseDataTableThatScrolls,F as DensityComfortable,P as DensityCompact,U as Empty,B as HideCaption,J as InteractiveRows,Q as Keyboard,q as LinkInRowHeader,W as Loading,G as LoadingEmpty,M as MaxHeightNone,N as MaxHeightViewport,V as NoStickyHeader,z as NothingToShow,I as OpenInvoices,j as ResponsiveScroll,A as ResponsiveStack,k as SelectableMultiple,D as SelectableNone,L as SelectableRows,O as SelectableSingle,H as Striped,X as WithFooter,Z as WithFooterContent,Y as WithRowActions,$ as __namedExportsOrder,S as default};