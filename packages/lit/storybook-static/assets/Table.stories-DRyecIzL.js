import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,w as n}from"./if-defined-CARySXJh.js";import{t as r}from"./Icon-eWCe5jE3.js";import{t as i}from"./Text-b_nq3K9L.js";import{t as a}from"./Button-B3rVveNU.js";import{t as o}from"./Link-CzFgI_Cj.js";import{c as s}from"./iframe-C6sywzE2.js";var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H;function U(){return(U=e((()=>{t(),s(),a(),r(),o(),i(),c=[{key:`invoice`,header:`Invoice`,isRowHeader:!0},{key:`due`,header:`Due`},{key:`amount`,header:`Amount`,align:`end`,sortable:!0}],l=[{id:`a`,invoice:`INV-1`,due:`12 Sep`,amount:100},{id:`b`,invoice:`INV-2`,due:`19 Sep`,amount:200}],u=e=>n`
  <ds-button variant="ghost" size="sm" icon-only label="More for ${String(e.invoice)}">
    <ds-icon slot="leading-icon" name="ellipsis" inline></ds-icon>
  </ds-button>
`,d={title:`Table/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`sort-change`,`selection-change`,`row-press`]}},argTypes:{captionLevel:{control:`select`,options:[`2`,`3`,`4`]},selectable:{control:`select`,options:[`none`,`single`,`multiple`]},responsive:{control:`select`,options:[`stack`,`scroll`]},maxHeight:{control:`select`,options:[`none`,`viewport`]},density:{control:`select`,options:[`compact`,`comfortable`]},hideCaption:{control:`boolean`},stickyHeader:{control:`boolean`},striped:{control:`boolean`},loading:{control:`boolean`},pressableRows:{control:`boolean`},emptyMessage:{control:`text`}},args:{caption:`Open invoices`,captionLevel:`2`,hideCaption:!1,columns:c,data:l,selectable:`none`,responsive:`stack`,stickyHeader:!0,maxHeight:`none`,density:`comfortable`,striped:!1,loading:!1,pressableRows:!1},render:e=>n`
    <ds-table
      caption=${e.caption}
      caption-level=${e.captionLevel}
      ?hide-caption=${e.hideCaption}
      .columns=${e.columns}
      .data=${e.data}
      .sort=${e.sort}
      .defaultSort=${e.defaultSort}
      selectable=${e.selectable}
      .selected=${e.selected}
      .defaultSelected=${e.defaultSelected}
      responsive=${e.responsive}
      ?no-sticky-header=${!e.stickyHeader}
      max-height=${e.maxHeight}
      density=${e.density}
      ?striped=${e.striped}
      .emptyMessage=${e.emptyMessage}
      ?loading=${e.loading}
      .rowActions=${e.rowActions}
      ?pressable-rows=${e.pressableRows}
    ></ds-table>
  `},f={},p={args:{captionLevel:`2`}},m={args:{captionLevel:`3`}},h={args:{captionLevel:`4`}},g={args:{selectable:`none`}},_={args:{selectable:`single`}},v={args:{selectable:`multiple`}},y={args:{responsive:`stack`}},b={args:{responsive:`scroll`}},x={args:{maxHeight:`none`}},S={args:{maxHeight:`viewport`}},C={args:{density:`compact`}},w={args:{density:`comfortable`}},T={args:{caption:`Open invoices`,columns:[{key:`invoice`,header:`Invoice`,isRowHeader:!0},{key:`due`,header:`Due`},{key:`amount`,header:`Amount`,align:`end`,sortable:!0}],data:[{id:`a`,invoice:`INV-1`,due:`12 Sep`,amount:100},{id:`b`,invoice:`INV-2`,due:`19 Sep`,amount:200}]}},E={args:{caption:`Members`,selectable:`multiple`,defaultSelected:[`a`],columns:[{key:`person`,header:`Person`,isRowHeader:!0},{key:`role`,header:`Role`}],data:[{id:`a`,person:`Ana Souza`,role:`Admin`},{id:`b`,person:`Bo Lin`,role:`Editor`}]}},D={args:{caption:`Daily traffic`,responsive:`scroll`,density:`compact`,maxHeight:`viewport`,columns:[{key:`day`,header:`Day`,isRowHeader:!0},{key:`visits`,header:`Visits`,align:`end`},{key:`signups`,header:`Signups`,align:`end`}],data:[{id:`a`,day:`Monday`,visits:1200,signups:30},{id:`b`,day:`Tuesday`,visits:1450,signups:41}]}},O={args:{caption:`Open invoices`,emptyMessage:`No invoices yet.`,columns:[{key:`invoice`,header:`Invoice`,isRowHeader:!0}],data:[]}},k={args:{hideCaption:!0}},A={args:{stickyHeader:!1}},j={args:{striped:!0}},M={args:{data:[]}},N={args:{loading:!0}},P={args:{loading:!0,data:[]}},F={args:{defaultSort:{column:`amount`,direction:`descending`}}},I={args:{columns:[{key:`invoice`,header:`Invoice`,isRowHeader:!0,render:e=>n`<ds-link href="#${String(e.id)}" label=${String(e.invoice)}></ds-link>`},{key:`due`,header:`Due`,hideBelow:`prose`},{key:`amount`,header:`Amount`,align:`end`,sortable:!0}]}},L={args:{pressableRows:!0}},R={args:{rowActions:u}},z={render:e=>n`
    <ds-table caption=${e.caption} .columns=${e.columns} .data=${e.data}>
      <ds-text slot="footer">Total due: 300</ds-text>
    </ds-table>
  `},B={render:e=>n`
    <ds-table caption=${e.caption} .columns=${e.columns} .data=${e.data}>
      <ds-text slot="footer" element="p" size="sm" tone="muted">2 rows</ds-text>
    </ds-table>
  `},V={args:{selectable:`multiple`}},H=`Default.CaptionLevel2.CaptionLevel3.CaptionLevel4.SelectableNone.SelectableSingle.SelectableMultiple.ResponsiveStack.ResponsiveScroll.MaxHeightNone.MaxHeightViewport.DensityCompact.DensityComfortable.OpenInvoices.SelectableRows.DenseDataTableThatScrolls.NothingToShow.HideCaption.NoStickyHeader.Striped.Empty.Loading.LoadingEmpty.DefaultSortDescending.LinkInRowHeader.InteractiveRows.WithRowActions.WithFooter.WithFooterContent.Keyboard`.split(`.`),f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '2'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '3'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '4'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'none'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'single'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'multiple'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    responsive: 'stack'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    responsive: 'scroll'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    maxHeight: 'none'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    maxHeight: 'viewport'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    density: 'compact'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    density: 'comfortable'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    hideCaption: true
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    stickyHeader: false
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    striped: true
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    data: []
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true,
    data: []
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    defaultSort: {
      column: 'amount',
      direction: 'descending'
    }
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    columns: [{
      key: 'invoice',
      header: 'Invoice',
      isRowHeader: true,
      render: row => html\`<ds-link href="#\${String(row.id)}" label=\${String(row['invoice'])}></ds-link>\`
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
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    pressableRows: true
  }
}`,...L.parameters?.docs?.source},description:{story:"Lit cannot see whether anyone listens for `row-press`, so interactive rows are opt-in.",...L.parameters?.docs?.description}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    rowActions: moreAction
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <ds-table caption=\${args.caption} .columns=\${args.columns} .data=\${args.data}>
      <ds-text slot="footer">Total due: 300</ds-text>
    </ds-table>
  \`
}`,...z.parameters?.docs?.source},description:{story:"Lit takes only slotted footer content; the string form has no Lit spelling, so slot a `ds-text`.",...z.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <ds-table caption=\${args.caption} .columns=\${args.columns} .data=\${args.data}>
      <ds-text slot="footer" element="p" size="sm" tone="muted">2 rows</ds-text>
    </ds-table>
  \`
}`,...B.parameters?.docs?.source},description:{story:`Other footer content brings its own typography.`,...B.parameters?.docs?.description}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'multiple'
  }
}`,...V.parameters?.docs?.source},description:{story:`Present with more than three focusable children: select-all, a sort button, and a Checkbox per row.`,...V.parameters?.docs?.description}}}})))()}U();export{p as CaptionLevel2,m as CaptionLevel3,h as CaptionLevel4,f as Default,F as DefaultSortDescending,D as DenseDataTableThatScrolls,w as DensityComfortable,C as DensityCompact,M as Empty,k as HideCaption,L as InteractiveRows,V as Keyboard,I as LinkInRowHeader,N as Loading,P as LoadingEmpty,x as MaxHeightNone,S as MaxHeightViewport,A as NoStickyHeader,O as NothingToShow,T as OpenInvoices,b as ResponsiveScroll,y as ResponsiveStack,v as SelectableMultiple,g as SelectableNone,E as SelectableRows,_ as SelectableSingle,j as Striped,z as WithFooter,B as WithFooterContent,R as WithRowActions,H as __namedExportsOrder,d as default};