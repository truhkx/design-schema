import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,w as n}from"./if-defined-CARySXJh.js";import{t as r}from"./Button-DJvb7DFH.js";import{t as i}from"./Select-CR8lS8kO.js";import{h as a,u as o}from"./iframe-CV6aZYyO.js";var s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{t(),o(),r(),a(),i(),s=e=>n`<ds-button variant="ghost" label=${e} overflow-label=${e}></ds-button>`,c=`Two labelled groups of ghost Buttons: Text style (Bold, Italic, Underline) and Alignment (Align left, Align center, Align right)`,l={[c]:()=>n`
    <ds-toolbar-group label="Text style">${s(`Bold`)}${s(`Italic`)}${s(`Underline`)}</ds-toolbar-group>
    <ds-toolbar-group label="Alignment">${s(`Align left`)}${s(`Align center`)}${s(`Align right`)}</ds-toolbar-group>
  `,"Three ghost text Buttons labelled Bold, Italic and Underline (the icon set has no formatting glyphs)":()=>n`${s(`Bold`)}${s(`Italic`)}${s(`Underline`)}`,"Three ghost text Buttons labelled Select, Draw and Erase":()=>n`${s(`Select`)}${s(`Draw`)}${s(`Erase`)}`,"Four ghost text Buttons labelled Filter, Sort, Export and Delete, each with the same overflowLabel":()=>n`${s(`Filter`)}${s(`Sort`)}${s(`Export`)}${s(`Delete`)}`,"A SegmentedControl labelled View (List, Board) and two Selects: Owner (name owner; Anyone, Me) and Sort (name sort; Newest, Oldest)":()=>n`
      <ds-segmented-control
        label="View"
        .options=${[{value:`list`,label:`List`},{value:`board`,label:`Board`}]}
      ></ds-segmented-control>
      <ds-select
        label="Owner"
        name="owner"
        hide-label
        .options=${[{value:`anyone`,label:`Anyone`},{value:`me`,label:`Me`}]}
      ></ds-select>
      <ds-select
        label="Sort"
        name="sort"
        hide-label
        .options=${[{value:`newest`,label:`Newest`},{value:`oldest`,label:`Oldest`}]}
      ></ds-select>
    `},u={title:`Toolbar/Lit`,tags:[`autodocs`],argTypes:{children:{control:`select`,options:Object.keys(l)},orientation:{control:`select`,options:[`horizontal`,`vertical`]},overflow:{control:`select`,options:[`wrap`,`menu`,`scroll`]},size:{control:`select`,options:[`sm`,`md`]},density:{control:`select`,options:[`compact`,`comfortable`]}},args:{label:`Formatting`,children:c,orientation:`horizontal`,overflow:`menu`,size:`md`,density:`comfortable`},render:e=>n`
    <ds-toolbar
      label=${e.label}
      orientation=${e.orientation}
      overflow=${e.overflow}
      size=${e.size}
      density=${e.density}
    >
      ${(l[e.children]??l[c])()}
    </ds-toolbar>
  `},d={},f={args:{orientation:`horizontal`}},p={args:{orientation:`vertical`}},m={args:{overflow:`wrap`}},h={args:{overflow:`menu`}},g={args:{overflow:`scroll`}},_={args:{size:`sm`}},v={args:{size:`md`}},y={args:{density:`compact`}},b={args:{density:`comfortable`}},x={args:{overflow:`menu`},decorators:[e=>n`<div style="max-inline-size: 16rem;">${e()}</div>`]},S={args:{overflow:`scroll`},decorators:[e=>n`<div style="max-inline-size: 16rem;">${e()}</div>`]},C={},w={args:{label:`Formatting`,children:`Three ghost text Buttons labelled Bold, Italic and Underline (the icon set has no formatting glyphs)`}},T={args:{label:`Drawing tools`,children:`Three ghost text Buttons labelled Select, Draw and Erase`,orientation:`vertical`}},E={args:{label:`Table actions`,children:`Four ghost text Buttons labelled Filter, Sort, Export and Delete, each with the same overflowLabel`,overflow:`menu`,density:`compact`,size:`sm`}},D={args:{label:`Filters`,children:`A SegmentedControl labelled View (List, Board) and two Selects: Owner (name owner; Anyone, Me) and Sort (name sort; Newest, Oldest)`,overflow:`scroll`}},O=[`Default`,`OrientationHorizontal`,`OrientationVertical`,`OverflowWrap`,`OverflowMenu`,`OverflowScroll`,`SizeSm`,`SizeMd`,`DensityCompact`,`DensityComfortable`,`OverflowMenuNarrow`,`OverflowScrollNarrow`,`Keyboard`,`FormattingToolbar`,`VerticalToolPalette`,`CompactActionsWithOverflow`,`ScrollingFilterRow`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'vertical'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    overflow: 'wrap'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    overflow: 'menu'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    overflow: 'scroll'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    density: 'compact'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    density: 'comfortable'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    overflow: 'menu'
  },
  decorators: [story => html\`<div style="max-inline-size: 16rem;">\${story()}</div>\`]
}`,...x.parameters?.docs?.source},description:{story:`Narrow width so trailing entries collapse into the More menu.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    overflow: 'scroll'
  },
  decorators: [story => html\`<div style="max-inline-size: 16rem;">\${story()}</div>\`]
}`,...S.parameters?.docs?.source},description:{story:`Narrow width so the row scrolls and its edges fade while content is hidden past them.`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{}`,...C.parameters?.docs?.source},description:{story:`Six focusable controls in two groups: Tab enters once, arrows move, Home/End jump.`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Formatting',
    children: 'Three ghost text Buttons labelled Bold, Italic and Underline (the icon set has no formatting glyphs)'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Drawing tools',
    children: 'Three ghost text Buttons labelled Select, Draw and Erase',
    orientation: 'vertical'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Table actions',
    children: 'Four ghost text Buttons labelled Filter, Sort, Export and Delete, each with the same overflowLabel',
    overflow: 'menu',
    density: 'compact',
    size: 'sm'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Filters',
    children: 'A SegmentedControl labelled View (List, Board) and two Selects: Owner (name owner; Anyone, Me) and Sort (name sort; Newest, Oldest)',
    overflow: 'scroll'
  }
}`,...D.parameters?.docs?.source}}}})))()}k();export{E as CompactActionsWithOverflow,d as Default,b as DensityComfortable,y as DensityCompact,w as FormattingToolbar,C as Keyboard,f as OrientationHorizontal,p as OrientationVertical,h as OverflowMenu,x as OverflowMenuNarrow,g as OverflowScroll,S as OverflowScrollNarrow,m as OverflowWrap,D as ScrollingFilterRow,v as SizeMd,_ as SizeSm,T as VerticalToolPalette,O as __namedExportsOrder,u as default};