import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{r,t as i}from"./if-defined-BfpvQ5_i.js";import{o as a}from"./iframe-CsoUKhN4.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{t(),i(),a(),o={title:`TreeGrid/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`expand-change`,`expand`,`sort-change`,`selection-change`,`cell-change`,`column-resize`]}},argTypes:{selectable:{control:`select`,options:[`none`,`row`,`cell`]},density:{control:`select`,options:[`compact`,`comfortable`]},height:{control:`select`,options:[`content`,`viewport`,`fixed`]},hideCaption:{control:`boolean`},selectChildren:{control:`boolean`},editable:{control:`boolean`},stickyHeader:{control:`boolean`},loading:{control:`boolean`},showStatusBar:{control:`boolean`},emptyMessage:{control:`text`}},args:{caption:`Chart of accounts`,hideCaption:!1,columns:[{key:`name`,header:`Account`,isRowHeader:!0,width:220,resizable:!0},{key:`code`,header:`Code`,width:100},{key:`balance`,header:`Balance (USD)`,align:`end`,sortable:!0,editable:!0,editor:`number`,width:140}],data:[{id:`assets`,name:`Assets`,code:`1000`,balance:125e3,children:[{id:`current-assets`,name:`Current assets`,code:`1100`,balance:85e3,children:[{id:`cash`,name:`Cash`,code:`1110`,balance:5e4},{id:`receivables`,name:`Accounts receivable`,code:`1120`,balance:35e3}]},{id:`fixed-assets`,name:`Fixed assets`,code:`1200`,balance:4e4,children:[{id:`equipment`,name:`Equipment`,code:`1210`,balance:4e4}]}]},{id:`liabilities`,name:`Liabilities`,code:`2000`,balance:42e3,children:[{id:`payables`,name:`Accounts payable`,code:`2100`,balance:42e3}]},{id:`equity`,name:`Equity`,code:`3000`,balance:83e3,children:`lazy`}],defaultExpanded:[`assets`,`current-assets`],selectable:`none`,selectChildren:!1,editable:!1,density:`compact`,height:`viewport`,stickyHeader:!0,loading:!1,showStatusBar:!0},render:e=>n`
    <ds-tree-grid
      caption=${e.caption}
      ?hide-caption=${e.hideCaption}
      .columns=${e.columns}
      .data=${e.data}
      .defaultExpanded=${e.defaultExpanded??[]}
      selectable=${e.selectable}
      ?select-children=${e.selectChildren}
      ?editable=${e.editable}
      density=${e.density}
      height=${e.height}
      ?no-sticky-header=${!e.stickyHeader}
      ?loading=${e.loading}
      ?no-status-bar=${!e.showStatusBar}
      empty-message=${r(e.emptyMessage)}
      @expand-change=${e=>console.log(`expand-change`,e.detail)}
      @expand=${e=>console.log(`expand`,e.detail)}
      @sort-change=${e=>console.log(`sort-change`,e.detail)}
      @selection-change=${e=>console.log(`selection-change`,e.detail)}
      @cell-change=${e=>console.log(`cell-change`,e.detail)}
      @column-resize=${e=>console.log(`column-resize`,e.detail)}
    ></ds-tree-grid>
  `},s={},c={args:{selectable:`none`}},l={args:{selectable:`row`}},u={args:{selectable:`cell`}},d={args:{density:`compact`}},f={args:{density:`comfortable`}},p={args:{height:`content`}},m={args:{height:`viewport`}},h={args:{height:`fixed`}},g={args:{hideCaption:!0}},_={args:{selectable:`row`,selectChildren:!0}},v={args:{editable:!0}},y={args:{loading:!0}},b={args:{data:[]}},x={args:{showStatusBar:!1}},S={args:{stickyHeader:!1,height:`content`}},C={args:{defaultExpanded:[`*`]}},w={args:{defaultExpanded:[`equity`]}},T={args:{data:[],emptyMessage:`No accounts yet.`}},E={args:{defaultExpanded:[`*`],editable:!0}},D=[`Default`,`SelectableNone`,`SelectableRow`,`SelectableCell`,`DensityCompact`,`DensityComfortable`,`HeightContent`,`HeightViewport`,`HeightFixed`,`HideCaption`,`SelectChildren`,`Editable`,`Loading`,`Empty`,`NoStatusBar`,`NoStickyHeader`,`AllExpanded`,`Lazy`,`CustomEmptyMessage`,`Keyboard`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'none'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'row'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'cell'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    density: 'compact'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    density: 'comfortable'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'content'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'viewport'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'fixed'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    hideCaption: true
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'row',
    selectChildren: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    editable: true
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    data: []
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    showStatusBar: false
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    stickyHeader: false,
    height: 'content'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    defaultExpanded: ['*']
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    defaultExpanded: ['equity']
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    data: [],
    emptyMessage: 'No accounts yet.'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    defaultExpanded: ['*'],
    editable: true
  }
}`,...E.parameters?.docs?.source},description:{story:"A fully expanded tree with a sortable, editable balance column — enough focusable structure (several row\r\nheaders with children, several leaves) to exercise ArrowLeft/ArrowRight/`*` expansion and Enter/F2 editing.",...E.parameters?.docs?.description}}}})))()}O();export{C as AllExpanded,T as CustomEmptyMessage,s as Default,f as DensityComfortable,d as DensityCompact,v as Editable,b as Empty,p as HeightContent,h as HeightFixed,m as HeightViewport,g as HideCaption,E as Keyboard,w as Lazy,y as Loading,x as NoStatusBar,S as NoStickyHeader,_ as SelectChildren,u as SelectableCell,c as SelectableNone,l as SelectableRow,D as __namedExportsOrder,o as default};