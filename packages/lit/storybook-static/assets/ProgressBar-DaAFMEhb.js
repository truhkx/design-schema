import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{C as t,a as n,c as r,d as i,f as a,h as o,p as s,r as c,s as l,t as u,u as d,y as f}from"./decorators-BlUBDG4K.js";import{a as p,i as m}from"./if-defined-BfpvQ5_i.js";import{n as h,t as g}from"./class-map-ByT5L8jj.js";import{t as _}from"./Text-Dgpz9DWN.js";import{r as v,t as y}from"./style-map-BVFfHnm-.js";var b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J;function Y(){return(Y=e((()=>{i(),a(),u(),g(),y(),p(),_(),U=(e,t)=>`${e}: ${t}`,W=e=>`${e}: complete`,G=e=>`${e}: in progress`,K={fromAttribute(e){return e===null},toAttribute(e){return e?null:``}},q={track:`--ds-progress-bar-track`,trackHeight:`--ds-progress-bar-track-height`,radius:`--ds-progress-bar-radius`,labelSize:`--ds-progress-bar-label-size`,labelWeight:`--ds-progress-bar-label-weight`,valueSize:`--ds-progress-bar-value-size`,fontFamily:`--ds-progress-bar-font-family`,lineHeight:`--ds-progress-bar-line-height`,partGap:`--ds-progress-bar-part-gap`,transition:`--ds-progress-bar-transition`,indeterminateLoop:`--ds-progress-bar-indeterminate-loop`},new class extends r{static[class extends s{static{({e:[x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H],c:[J,b]}=d(this,[l(`ds-progress-bar`)],[[n(),1,`label`],[n({type:Number}),1,`value`],[n({type:Number}),1,`min`],[n({type:Number}),1,`max`],[n({attribute:!1}),1,`formatValue`],[n({attribute:`hide-value`,converter:K}),1,`showValue`],[n({type:Boolean,reflect:!0,attribute:`hide-label`}),1,`hideLabel`],[n({reflect:!0}),1,`tone`],[n({reflect:!0}),1,`announce`],[n({attribute:!1}),1,`overrides`],[c(),1,`liveMessage`]],0,void 0,s))}#e=x(this,``);get label(){return this.#e}set label(e){this.#e=e}#t=(S(this),C(this));get value(){return this.#t}set value(e){this.#t=e}#n=(w(this),T(this,0));get min(){return this.#n}set min(e){this.#n=e}#r=(E(this),D(this,100));get max(){return this.#r}set max(e){this.#r=e}#i=(O(this),k(this));get formatValue(){return this.#i}set formatValue(e){this.#i=e}#a=(A(this),j(this,!0));get showValue(){return this.#a}set showValue(e){this.#a=e}#o=(M(this),N(this,!1));get hideLabel(){return this.#o}set hideLabel(e){this.#o=e}#s=(P(this),F(this,`neutral`));get tone(){return this.#s}set tone(e){this.#s=e}#c=(I(this),L(this,`complete`));get announce(){return this.#c}set announce(e){this.#c=e}#l=(R(this),z(this));get overrides(){return this.#l}set overrides(e){this.#l=e}#u=(B(this),V(this,``));get liveMessage(){return this.#u}set liveMessage(e){this.#u=e}announcedMilestone=(H(this),0);announcedComplete=!1;announcedIndeterminate=!1;connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`ProgressBar`),this.setAttribute(`role`,`progressbar`)}get isIndeterminate(){return this.value===void 0}get clampedValue(){let e=Number(this.min),t=Number(this.max),n=Number(this.value);return this.isIndeterminate||!(t>e)||!Number.isFinite(n)?e:Math.min(t,Math.max(e,n))}get percent(){if(this.isIndeterminate)return 0;let e=Number(this.min),t=Number(this.max);return t>e?(this.clampedValue-e)/(t-e)*100:0}get displayText(){return this.formatValue?this.formatValue(this.clampedValue,Number(this.min),Number(this.max)):`${Math.round(this.percent)}%`}willUpdate(e){e.has(`overrides`)&&this.applyOverrides(),this.warnInDev(e)}updated(){this.syncHostAria(),this.updateAnnouncements()}render(){let e=this.isIndeterminate;return f`
      <div class="container" part="container">
        <div class="row">
          <ds-text
            part="label"
            size="sm"
            weight="medium"
            class=${h({"visually-hidden":this.hideLabel})}
            .overrides=${this.labelTextOverrides}
            >${this.label}</ds-text
          >
          ${this.showValue&&!e?f`<ds-text part="valueText" size="sm" tone="muted" .overrides=${this.valueTextOverrides}
                >${this.displayText}</ds-text
              >`:o}
        </div>
        <div class=${h({track:!0,indeterminate:e})} part="track">
          <div
            class=${h({fill:!0,indeterminate:e})}
            part="fill"
            style=${e?o:v({inlineSize:`${this.percent}%`})}
          ></div>
        </div>
        <div class="visually-hidden" role="status" aria-live="polite">${this.liveMessage}</div>
      </div>
    `}syncHostAria(){this.setAttribute(`aria-valuemin`,String(Number(this.min))),this.setAttribute(`aria-valuemax`,String(Number(this.max))),this.label?this.setAttribute(`aria-label`,this.label):this.removeAttribute(`aria-label`),this.isIndeterminate?(this.removeAttribute(`aria-valuenow`),this.removeAttribute(`aria-valuetext`),this.setAttribute(`aria-busy`,`true`)):(this.setAttribute(`aria-valuenow`,String(this.clampedValue)),this.setAttribute(`aria-valuetext`,this.displayText),this.removeAttribute(`aria-busy`))}updateAnnouncements(){if(this.announce===`none`)return;if(this.isIndeterminate){this.announcedMilestone=0,this.announcedComplete=!1,this.announcedIndeterminate||(this.announcedIndeterminate=!0,this.liveMessage=G(this.label));return}this.announcedIndeterminate=!1;let e=this.percent;if(e>=100){this.announcedMilestone=100,this.announcedComplete||(this.announcedComplete=!0,this.liveMessage=W(this.label));return}if(this.announcedComplete=!1,this.announce!==`milestones`)return;let t=Math.floor(e/25)*25;t!==this.announcedMilestone&&(this.announcedMilestone=t,t>0&&(this.liveMessage=U(this.label,this.displayText)))}get labelTextOverrides(){let e={};return this.overrides?.fontFamily&&(e.fontFamily=this.overrides.fontFamily),this.overrides?.labelSize&&(e.fontSize=this.overrides.labelSize),this.overrides?.labelWeight&&(e.fontWeight=this.overrides.labelWeight),e}get valueTextOverrides(){let e={};return this.overrides?.fontFamily&&(e.fontFamily=this.overrides.fontFamily),this.overrides?.valueSize&&(e.fontSize=this.overrides.valueSize),e}applyOverrides(){for(let e of Object.keys(q)){let t=this.overrides?.[e],n=q[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,m(t))}}warnInDev(e){}}];styles=t`
    :host {
      display: block;
      font-family: var(--ds-progress-bar-font-family);
      --ds-progress-bar-track: var(--color-background-strong);
      --ds-progress-bar-track-height: var(--space-2);
      --ds-progress-bar-radius: var(--radius-full);
      --ds-progress-bar-label-size: var(--font-size-sm);
      --ds-progress-bar-label-weight: var(--font-weight-medium);
      --ds-progress-bar-value-size: var(--font-size-sm);
      --ds-progress-bar-font-family: var(--font-family-body);
      --ds-progress-bar-line-height: var(--font-line-height-normal);
      --ds-progress-bar-part-gap: var(--space-1);
      --ds-progress-bar-transition: var(--motion-duration-base);
      --ds-progress-bar-indeterminate-loop: var(--motion-duration-loop);
    }

    :host([hidden]) {
      display: none;
    }

    .container {
      display: flex;
      flex-direction: column;
      gap: var(--ds-progress-bar-part-gap);
    }

    .row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--space-2);
      line-height: var(--ds-progress-bar-line-height);
    }

    .visually-hidden {
      /* literal-ok: standard visually-hidden clip pattern, exempt from token-only rule */
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }

    /* track: color.background.strong */
    .track {
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
      block-size: var(--ds-progress-bar-track-height);
      border-radius: var(--ds-progress-bar-radius);
      background: var(--ds-progress-bar-track);
    }

    /* fill: color.control.selectedBackground, locked (neutral fill) */
    .fill {
      position: absolute;
      inset-block: 0;
      inset-inline-start: 0;
      inline-size: 0;
      border-radius: var(--ds-progress-bar-radius);
      background: var(--color-control-selected-background);
    }
    /* fillSuccess: color.status.success.icon, locked */
    :host([tone='success']) .fill {
      background: var(--color-status-success-icon);
    }
    /* fillDanger: color.status.danger.icon, locked */
    :host([tone='danger']) .fill {
      background: var(--color-status-danger-icon);
    }

    @media (prefers-reduced-motion: no-preference) {
      .fill:not(.indeterminate) {
        transition: inline-size var(--ds-progress-bar-transition) var(--motion-easing-standard);
      }

      /* indeterminateLoop: a fill one third of the track width sweeping start to end, repeating */
      .fill.indeterminate {
        inline-size: 33.333%;
        animation: ds-progress-bar-sweep var(--ds-progress-bar-indeterminate-loop) linear infinite;
      }
      @keyframes ds-progress-bar-sweep {
        from {
          transform: translateX(-100%);
        }
        to {
          transform: translateX(300%);
        }
      }
    }

    /* Reduced motion: no sweep at all — a static, half-opacity track instead. */
    @media (prefers-reduced-motion: reduce) {
      .fill.indeterminate {
        display: none;
      }
      .track.indeterminate {
        opacity: var(--opacity-disabled);
      }
    }
  `;constructor(){super(J),b()}}})))()}export{Y as t};