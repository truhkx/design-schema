import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./Card-GrjfSIWe.js";import{l as o}from"./iframe-DJFLK4ZL.js";var s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S;function C(){return(C=e((()=>{t(),r(),o(),a(),s=(e,t)=>e.map(e=>i`
      <ds-carousel-slide label=${e}>
        <ds-card heading=${e} heading-level="3">${t(e)}</ds-card>
      </ds-carousel-slide>
    `),c=(e,t)=>i`
  <ds-carousel
    label=${e.label}
    per-view=${e.perView}
    interval=${e.interval}
    picker=${e.picker}
    active-index=${n(e.activeIndex)}
    ?loop=${e.loop}
    ?autoplay=${e.autoplay}
    ?no-snap=${!e.snap}
  >
    ${t}
  </ds-carousel>
`,l={title:`Carousel/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`]}},argTypes:{picker:{control:`select`,options:[`dots`,`tabs`,`none`]},perView:{control:`number`},interval:{control:`number`},activeIndex:{control:`number`},loop:{control:`boolean`},autoplay:{control:`boolean`},snap:{control:`boolean`}},args:{label:`Featured products`,perView:1,loop:!1,autoplay:!1,interval:6e3,picker:`dots`,snap:!0},render:e=>c(e,s([`Product 1`,`Product 2`,`Product 3`],()=>`A product worth a closer look.`))},u={},d={args:{picker:`dots`}},f={args:{picker:`tabs`}},p={args:{picker:`none`}},m={args:{loop:!0}},h={args:{snap:!1}},g={args:{activeIndex:1}},_={args:{label:`Featured products`},render:e=>c(e,s([`Product 1`,`Product 2`,`Product 3`,`Product 4`],()=>`A product worth a closer look.`))},v={args:{label:`Plans`,picker:`tabs`},render:e=>c(e,s([`Starter`,`Team`,`Enterprise`],e=>`What the ${e} plan includes.`))},y={args:{label:`Customer stories`,autoplay:!0,interval:8e3,loop:!0},render:e=>c(e,s([`Story 1`,`Story 2`,`Story 3`],()=>`Stands in for a photograph.`))},b={args:{label:`Gallery`,perView:3,picker:`none`},render:e=>c(e,s([`Image 1`,`Image 2`,`Image 3`,`Image 4`,`Image 5`,`Image 6`],()=>`Stands in for an image.`))},x={args:{picker:`tabs`}},S=[`Default`,`PickerDots`,`PickerTabs`,`PickerNone`,`Loop`,`NoSnap`,`Controlled`,`FeaturedProducts`,`NamedSlidesWithTabs`,`AmbientHero`,`ThreeUpGallery`,`Keyboard`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    picker: 'dots'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    picker: 'tabs'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    picker: 'none'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    loop: true
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    snap: false
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    activeIndex: 1
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Featured products'
  },
  render: args => carousel(args, slides(['Product 1', 'Product 2', 'Product 3', 'Product 4'], () => 'A product worth a closer look.'))
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Plans',
    picker: 'tabs'
  },
  render: args => carousel(args, slides(['Starter', 'Team', 'Enterprise'], name => \`What the \${name} plan includes.\`))
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Customer stories',
    autoplay: true,
    interval: 8000,
    loop: true
  },
  render: args => carousel(args, slides(['Story 1', 'Story 2', 'Story 3'], () => 'Stands in for a photograph.'))
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Gallery',
    perView: 3,
    picker: 'none'
  },
  render: args => carousel(args, slides(['Image 1', 'Image 2', 'Image 3', 'Image 4', 'Image 5', 'Image 6'], () => 'Stands in for an image.'))
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    picker: 'tabs'
  }
}`,...x.parameters?.docs?.source},description:{story:`Present with its controls: previous, next and three picker tabs are focusable.`,...x.parameters?.docs?.description}}}})))()}C();export{y as AmbientHero,g as Controlled,u as Default,_ as FeaturedProducts,x as Keyboard,m as Loop,v as NamedSlidesWithTabs,h as NoSnap,d as PickerDots,p as PickerNone,f as PickerTabs,b as ThreeUpGallery,S as __namedExportsOrder,l as default};