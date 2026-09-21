import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{o as a}from"./iframe-CV6aZYyO.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M;function N(){return(N=e((()=>{t(),r(),a(),o={title:`TreeGrid/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`expand-change`,`expand`,`sort-change`,`selection-change`,`cell-change`,`edit-start`,`column-resize`]}},argTypes:{captionLevel:{control:`select`,options:[`2`,`3`,`4`]},selectable:{control:`select`,options:[`none`,`row`,`cell`]},density:{control:`select`,options:[`compact`,`comfortable`]},height:{control:`select`,options:[`content`,`viewport`,`fixed`]},hideCaption:{control:`boolean`},selectChildren:{control:`boolean`},editable:{control:`boolean`},loading:{control:`boolean`},showStatusBar:{control:`boolean`},stickyHeader:{control:`boolean`},emptyMessage:{control:`text`}},args:{caption:`Chart of accounts`,captionLevel:`2`,hideCaption:!1,columns:[{key:`name`,header:`Account`,isRowHeader:!0,width:240,resizable:!0},{key:`code`,header:`Code`,width:96},{key:`balance`,header:`Balance`,align:`end`,sortable:!0,editable:!0,editor:`number`,width:144}],data:[{id:`assets`,name:`Assets`,code:`1000`,balance:125e3,children:[{id:`current-assets`,name:`Current assets`,code:`1100`,balance:85e3,children:[{id:`cash`,name:`Cash`,code:`1110`,balance:5e4},{id:`receivables`,name:`Accounts receivable`,code:`1120`,balance:35e3}]},{id:`fixed-assets`,name:`Fixed assets`,code:`1200`,balance:4e4,children:[{id:`equipment`,name:`Equipment`,code:`1210`,balance:4e4}]}]},{id:`liabilities`,name:`Liabilities`,code:`2000`,balance:42e3,children:[{id:`payables`,name:`Accounts payable`,code:`2100`,balance:42e3}]},{id:`equity`,name:`Equity`,code:`3000`,balance:83e3,children:`lazy`}],defaultExpanded:[`assets`,`current-assets`],selectable:`none`,selectChildren:!1,editable:!1,density:`compact`,height:`viewport`,loading:!1,showStatusBar:!0,stickyHeader:!0},render:e=>i`
    <ds-tree-grid
      caption=${e.caption}
      caption-level=${e.captionLevel}
      ?hide-caption=${e.hideCaption}
      .columns=${e.columns}
      .data=${e.data}
      .expanded=${e.expanded}
      .defaultExpanded=${e.defaultExpanded}
      .sort=${e.sort}
      .defaultSort=${e.defaultSort}
      selectable=${e.selectable}
      .selected=${e.selected}
      .defaultSelected=${e.defaultSelected}
      ?select-children=${e.selectChildren}
      ?editable=${e.editable}
      density=${e.density}
      height=${e.height}
      ?loading=${e.loading}
      ?no-status-bar=${!e.showStatusBar}
      ?no-sticky-header=${!e.stickyHeader}
      empty-message=${n(e.emptyMessage)}
    ></ds-tree-grid>
  `},s={},c={args:{captionLevel:`2`}},l={args:{captionLevel:`3`}},u={args:{captionLevel:`4`}},d={args:{selectable:`none`}},f={args:{selectable:`row`}},p={args:{selectable:`cell`}},m={args:{density:`compact`}},h={args:{density:`comfortable`}},g={args:{height:`content`}},_={args:{height:`viewport`}},v={args:{height:`fixed`}},y={args:{hideCaption:!0}},b={args:{selectable:`row`,selectChildren:!0,defaultExpanded:[`*`]}},x={args:{editable:!0}},S={args:{loading:!0}},C={args:{defaultExpanded:[`equity`]}},w={args:{data:[]}},T={args:{showStatusBar:!1}},E={args:{stickyHeader:!1,height:`content`}},D={args:{caption:`Chart of accounts`,defaultExpanded:[`assets`],columns:[{key:`account`,header:`Account`,isRowHeader:!0,width:240},{key:`balance`,header:`Balance`,align:`end`}],data:[{id:`assets`,account:`Assets`,balance:1400,children:[{id:`cash`,account:`Cash`,balance:400},{id:`stock`,account:`Stock`,balance:1e3}]},{id:`equity`,account:`Equity`,balance:1400}]}},O={args:{caption:`Files`,columns:[{key:`name`,header:`Name`,isRowHeader:!0},{key:`size`,header:`Size`,align:`end`}],data:[{id:`docs`,name:`Documents`,size:0,children:`lazy`},{id:`media`,name:`Media`,size:0,children:`lazy`}]}},k={args:{caption:`Bill of materials`,selectable:`row`,selectChildren:!0,defaultExpanded:[`*`],columns:[{key:`part`,header:`Part`,isRowHeader:!0},{key:`quantity`,header:`Quantity`,align:`end`}],data:[{id:`frame`,part:`Frame`,quantity:1,children:[{id:`bolt`,part:`Bolt`,quantity:8}]}]}},A={args:{caption:`Bill of materials`,editable:!0,defaultExpanded:[`*`],columns:[{key:`part`,header:`Part`,isRowHeader:!0},{key:`quantity`,header:`Quantity`,align:`end`,editable:!0,editor:`number`}],data:[{id:`frame`,part:`Frame`,quantity:1,children:[{id:`bolt`,part:`Bolt`,quantity:8}]}]}},j={args:{defaultExpanded:[`*`],editable:!0,selectable:`row`,height:`content`}},M=[`Default`,`CaptionLevel2`,`CaptionLevel3`,`CaptionLevel4`,`SelectableNone`,`SelectableRow`,`SelectableCell`,`DensityCompact`,`DensityComfortable`,`HeightContent`,`HeightViewport`,`HeightFixed`,`HideCaption`,`SelectChildren`,`Editable`,`Loading`,`LazyRowLoading`,`Empty`,`NoStatusBar`,`NoStickyHeader`,`ChartOfAccounts`,`LazyFolders`,`CascadingSelection`,`EditableQuantities`,`Keyboard`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '2'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '3'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '4'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'none'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'row'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'cell'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    density: 'compact'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    density: 'comfortable'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'content'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'viewport'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'fixed'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    hideCaption: true
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'row',
    selectChildren: true,
    defaultExpanded: ['*']
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    editable: true
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    defaultExpanded: ['equity']
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    data: []
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    showStatusBar: false
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    stickyHeader: false,
    height: 'content'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    caption: 'Chart of accounts',
    defaultExpanded: ['assets'],
    columns: [{
      key: 'account',
      header: 'Account',
      isRowHeader: true,
      width: 240
    }, {
      key: 'balance',
      header: 'Balance',
      align: 'end'
    }],
    data: [{
      id: 'assets',
      account: 'Assets',
      balance: 1400,
      children: [{
        id: 'cash',
        account: 'Cash',
        balance: 400
      }, {
        id: 'stock',
        account: 'Stock',
        balance: 1000
      }]
    }, {
      id: 'equity',
      account: 'Equity',
      balance: 1400
    }]
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    caption: 'Files',
    columns: [{
      key: 'name',
      header: 'Name',
      isRowHeader: true
    }, {
      key: 'size',
      header: 'Size',
      align: 'end'
    }],
    data: [{
      id: 'docs',
      name: 'Documents',
      size: 0,
      children: 'lazy'
    }, {
      id: 'media',
      name: 'Media',
      size: 0,
      children: 'lazy'
    }]
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    caption: 'Bill of materials',
    selectable: 'row',
    selectChildren: true,
    defaultExpanded: ['*'],
    columns: [{
      key: 'part',
      header: 'Part',
      isRowHeader: true
    }, {
      key: 'quantity',
      header: 'Quantity',
      align: 'end'
    }],
    data: [{
      id: 'frame',
      part: 'Frame',
      quantity: 1,
      children: [{
        id: 'bolt',
        part: 'Bolt',
        quantity: 8
      }]
    }]
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    caption: 'Bill of materials',
    editable: true,
    defaultExpanded: ['*'],
    columns: [{
      key: 'part',
      header: 'Part',
      isRowHeader: true
    }, {
      key: 'quantity',
      header: 'Quantity',
      align: 'end',
      editable: true,
      editor: 'number'
    }],
    data: [{
      id: 'frame',
      part: 'Frame',
      quantity: 1,
      children: [{
        id: 'bolt',
        part: 'Bolt',
        quantity: 8
      }]
    }]
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    defaultExpanded: ['*'],
    editable: true,
    selectable: 'row',
    height: 'content'
  }
}`,...j.parameters?.docs?.source},description:{story:"Fully expanded, sortable and editable: several parent row headers and leaves to exercise ArrowLeft/ArrowRight,\r\n`*`, Enter and F2. The grid is one tab stop; its cells are reached with the arrows.",...j.parameters?.docs?.description}}}})))()}N();export{c as CaptionLevel2,l as CaptionLevel3,u as CaptionLevel4,k as CascadingSelection,D as ChartOfAccounts,s as Default,h as DensityComfortable,m as DensityCompact,x as Editable,A as EditableQuantities,w as Empty,g as HeightContent,v as HeightFixed,_ as HeightViewport,y as HideCaption,j as Keyboard,O as LazyFolders,C as LazyRowLoading,S as Loading,T as NoStatusBar,E as NoStickyHeader,b as SelectChildren,p as SelectableCell,d as SelectableNone,f as SelectableRow,M as __namedExportsOrder,o as default};