import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./Text-BrJPDVza.js";import{t as o}from"./Box-CEXPuAx3.js";var s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X;function Z(){return(Z=e((()=>{t(),r(),o(),a(),s=[`none`,`sm`,`md`,`lg`,`xl`],c=[`none`,`default`,`subtle`,`strong`],l=[`none`,`sm`,`md`,`lg`,`full`],u=[`div`,`section`,`article`,`aside`,`header`,`footer`,`main`,`nav`],d={title:`Box/Lit`,tags:[`autodocs`],argTypes:{children:{control:`text`},inset:{control:`select`,options:s},insetBlock:{control:`select`,options:[void 0,...s]},insetInline:{control:`select`,options:[void 0,...s]},surface:{control:`select`,options:c},border:{control:`boolean`},radius:{control:`select`,options:l},element:{control:`select`,options:u}},args:{children:`Box content`,inset:`none`,insetBlock:void 0,insetInline:void 0,surface:`none`,border:!1,radius:`none`,element:`div`},render:e=>i`
    <ds-box
      inset=${e.inset}
      inset-block=${n(e.insetBlock)}
      inset-inline=${n(e.insetInline)}
      surface=${e.surface}
      ?border=${e.border}
      radius=${e.radius}
      element=${e.element}
    >
      <ds-text>${e.children}</ds-text>
    </ds-box>
  `,parameters:{docs:{description:{component:"Meta args are the schema defaults, so each example story carries exactly its `given`."}}}},f={args:{children:`A panel of settings`,inset:`md`,surface:`subtle`,radius:`md`}},p={args:{...f.args,inset:`none`}},m={args:{...f.args,inset:`sm`}},h={args:{...f.args,inset:`md`}},g={args:{...f.args,inset:`lg`}},_={args:{...f.args,inset:`xl`}},v={args:{...f.args,insetBlock:`none`}},y={args:{...f.args,insetBlock:`sm`}},b={args:{...f.args,insetBlock:`md`}},x={args:{...f.args,insetBlock:`lg`}},S={args:{...f.args,insetBlock:`xl`}},C={args:{...f.args,insetInline:`none`}},w={args:{...f.args,insetInline:`sm`}},T={args:{...f.args,insetInline:`md`}},E={args:{...f.args,insetInline:`lg`}},D={args:{...f.args,insetInline:`xl`}},O={args:{...f.args,surface:`none`}},k={args:{...f.args,surface:`default`}},A={args:{...f.args,surface:`subtle`}},j={args:{...f.args,surface:`strong`}},M={args:{...f.args,border:!0}},N={args:{...f.args,radius:`none`}},P={args:{...f.args,radius:`sm`}},F={args:{...f.args,radius:`md`}},I={args:{...f.args,radius:`lg`}},L={args:{...f.args,radius:`full`}},R={args:{...f.args,element:`div`}},z={args:{...f.args,element:`section`}},B={args:{...f.args,element:`article`}},V={args:{...f.args,element:`aside`}},H={args:{...f.args,element:`header`}},U={args:{...f.args,element:`footer`}},W={args:{...f.args,element:`main`}},G={args:{...f.args,element:`nav`}},K={args:{children:`A panel of settings`,inset:`md`,surface:`subtle`,radius:`md`}},q={args:{children:`A row of data`,inset:`sm`,border:!0}},J={args:{children:`A hero band`,insetBlock:`xl`,insetInline:`lg`,surface:`strong`}},Y={args:{children:`The sidebar links`,element:`nav`,inset:`md`}},X=`Default.InsetNone.InsetSm.InsetMd.InsetLg.InsetXl.InsetBlockNone.InsetBlockSm.InsetBlockMd.InsetBlockLg.InsetBlockXl.InsetInlineNone.InsetInlineSm.InsetInlineMd.InsetInlineLg.InsetInlineXl.SurfaceNone.SurfaceDefault.SurfaceSubtle.SurfaceStrong.Border.RadiusNone.RadiusSm.RadiusMd.RadiusLg.RadiusFull.ElementDiv.ElementSection.ElementArticle.ElementAside.ElementHeader.ElementFooter.ElementMain.ElementNav.HighlightedPanel.BorderedRow.HeroBand.NavigationRegion`.split(`.`),f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'A panel of settings',
    inset: 'md',
    surface: 'subtle',
    radius: 'md'
  }
}`,...f.parameters?.docs?.source},description:{story:"A Box at its schema defaults draws nothing, so Default uses the `highlighted-panel` example's props.",...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    inset: 'none'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    inset: 'sm'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    inset: 'md'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    inset: 'lg'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    inset: 'xl'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    insetBlock: 'none'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    insetBlock: 'sm'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    insetBlock: 'md'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    insetBlock: 'lg'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    insetBlock: 'xl'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    insetInline: 'none'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    insetInline: 'sm'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    insetInline: 'md'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    insetInline: 'lg'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    insetInline: 'xl'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    surface: 'none'
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    surface: 'default'
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    surface: 'subtle'
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    surface: 'strong'
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    border: true
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    radius: 'none'
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    radius: 'sm'
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    radius: 'md'
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    radius: 'lg'
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    radius: 'full'
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    element: 'div'
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    element: 'section'
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    element: 'article'
  }
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    element: 'aside'
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    element: 'header'
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    element: 'footer'
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    element: 'main'
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    element: 'nav'
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'A panel of settings',
    inset: 'md',
    surface: 'subtle',
    radius: 'md'
  }
}`,...K.parameters?.docs?.source},description:{story:`A panel lifted off the page with a tinted surface, rounded corners and the usual inset.`,...K.parameters?.docs?.description}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'A row of data',
    inset: 'sm',
    border: true
  }
}`,...q.parameters?.docs?.source},description:{story:`A dense row bounded by a thin border rather than a fill.`,...q.parameters?.docs?.description}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'A hero band',
    insetBlock: 'xl',
    insetInline: 'lg',
    surface: 'strong'
  }
}`,...J.parameters?.docs?.source},description:{story:`A full-width band with more vertical than horizontal padding, on the strongest surface.`,...J.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'The sidebar links',
    element: 'nav',
    inset: 'md'
  }
}`,...Y.parameters?.docs?.source},description:{story:`A padded region whose element makes it a navigation landmark on web.`,...Y.parameters?.docs?.description}}}})))()}Z();export{M as Border,q as BorderedRow,f as Default,B as ElementArticle,V as ElementAside,R as ElementDiv,U as ElementFooter,H as ElementHeader,W as ElementMain,G as ElementNav,z as ElementSection,J as HeroBand,K as HighlightedPanel,x as InsetBlockLg,b as InsetBlockMd,v as InsetBlockNone,y as InsetBlockSm,S as InsetBlockXl,E as InsetInlineLg,T as InsetInlineMd,C as InsetInlineNone,w as InsetInlineSm,D as InsetInlineXl,g as InsetLg,h as InsetMd,p as InsetNone,m as InsetSm,_ as InsetXl,Y as NavigationRegion,L as RadiusFull,I as RadiusLg,F as RadiusMd,N as RadiusNone,P as RadiusSm,k as SurfaceDefault,O as SurfaceNone,j as SurfaceStrong,A as SurfaceSubtle,X as __namedExportsOrder,d as default};