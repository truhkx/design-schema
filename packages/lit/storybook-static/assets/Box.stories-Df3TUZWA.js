import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{r,t as i}from"./if-defined-BfpvQ5_i.js";import{t as a}from"./Text-Dgpz9DWN.js";import{t as o}from"./Box-CZm3aDsl.js";var s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R;function z(){return(z=e((()=>{t(),i(),o(),a(),s=[`none`,`sm`,`md`,`lg`,`xl`],c=[`none`,`default`,`subtle`,`strong`],l=[`none`,`sm`,`md`,`lg`,`full`],u=[`div`,`section`,`article`,`aside`,`header`,`footer`,`main`,`nav`],d={title:`Box/Lit`,tags:[`autodocs`],argTypes:{inset:{control:`select`,options:s},insetBlock:{control:`select`,options:[void 0,...s]},insetInline:{control:`select`,options:[void 0,...s]},surface:{control:`select`,options:c},border:{control:`boolean`},radius:{control:`select`,options:l},element:{control:`select`,options:u}},args:{inset:`none`,insetBlock:void 0,insetInline:void 0,surface:`none`,border:!1,radius:`none`,element:`div`},render:e=>n`
    <ds-box
      inset=${e.inset}
      inset-block=${r(e.insetBlock)}
      inset-inline=${r(e.insetInline)}
      surface=${e.surface}
      ?border=${e.border}
      radius=${e.radius}
      element=${e.element}
    >
      <ds-text>Box content</ds-text>
    </ds-box>
  `},f={},p={args:{inset:`none`}},m={args:{inset:`sm`}},h={args:{inset:`md`}},g={args:{inset:`lg`}},_={args:{inset:`xl`}},v={args:{inset:`lg`,insetBlock:`sm`}},y={args:{inset:`lg`,insetInline:`sm`}},b={args:{surface:`none`}},x={args:{surface:`default`,inset:`md`}},S={args:{surface:`subtle`,inset:`md`}},C={args:{surface:`strong`,inset:`md`}},w={args:{border:!0,inset:`md`}},T={args:{radius:`none`,surface:`subtle`,inset:`md`}},E={args:{radius:`sm`,surface:`subtle`,inset:`md`}},D={args:{radius:`md`,surface:`subtle`,inset:`md`}},O={args:{radius:`lg`,surface:`subtle`,inset:`md`}},k={args:{radius:`full`,surface:`subtle`,inset:`md`}},A={args:{element:`div`}},j={args:{element:`section`}},M={args:{element:`article`}},N={args:{element:`aside`}},P={args:{element:`header`}},F={args:{element:`footer`}},I={args:{element:`main`}},L={args:{element:`nav`}},R=`Default.InsetNone.InsetSm.InsetMd.InsetLg.InsetXl.InsetBlockSm.InsetInlineSm.SurfaceNone.SurfaceDefault.SurfaceSubtle.SurfaceStrong.BorderTrue.RadiusNone.RadiusSm.RadiusMd.RadiusLg.RadiusFull.ElementDiv.ElementSection.ElementArticle.ElementAside.ElementHeader.ElementFooter.ElementMain.ElementNav`.split(`.`),f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    inset: 'none'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    inset: 'sm'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    inset: 'md'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    inset: 'lg'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    inset: 'xl'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    inset: 'lg',
    insetBlock: 'sm'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    inset: 'lg',
    insetInline: 'sm'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    surface: 'none'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    surface: 'default',
    inset: 'md'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    surface: 'subtle',
    inset: 'md'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    surface: 'strong',
    inset: 'md'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    border: true,
    inset: 'md'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    radius: 'none',
    surface: 'subtle',
    inset: 'md'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    radius: 'sm',
    surface: 'subtle',
    inset: 'md'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    radius: 'md',
    surface: 'subtle',
    inset: 'md'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    radius: 'lg',
    surface: 'subtle',
    inset: 'md'
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    radius: 'full',
    surface: 'subtle',
    inset: 'md'
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    element: 'div'
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    element: 'section'
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    element: 'article'
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    element: 'aside'
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    element: 'header'
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    element: 'footer'
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    element: 'main'
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    element: 'nav'
  }
}`,...L.parameters?.docs?.source}}}})))()}z();export{w as BorderTrue,f as Default,M as ElementArticle,N as ElementAside,A as ElementDiv,F as ElementFooter,P as ElementHeader,I as ElementMain,L as ElementNav,j as ElementSection,v as InsetBlockSm,y as InsetInlineSm,g as InsetLg,h as InsetMd,p as InsetNone,m as InsetSm,_ as InsetXl,k as RadiusFull,O as RadiusLg,D as RadiusMd,T as RadiusNone,E as RadiusSm,x as SurfaceDefault,b as SurfaceNone,C as SurfaceStrong,S as SurfaceSubtle,R as __namedExportsOrder,d as default};