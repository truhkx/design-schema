import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{O as t,_ as n,c as r,f as i,g as a,h as o,o as s,p as c,v as l,w as u}from"./if-defined-CARySXJh.js";import{t as d}from"./Text-BrJPDVza.js";import{t as f}from"./Button-DJvb7DFH.js";import{t as p}from"./Heading-Ca-mCASW.js";import{t as m}from"./Input-DW6UoXDO.js";import{t as h}from"./Stack-CZci_zJ9.js";import{t as g}from"./Checkbox-3bTNXSrN.js";import{t as _}from"./Card-e_oTv443.js";import{A as v,C as y,D as b,M as x,O as S,S as C,g as w,h as T,j as E,k as D,w as O,x as k}from"./iframe-CV6aZYyO.js";var A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J;function Y(){return(Y=e((()=>{a(),n(),s(),b(),O(),h(),p(),w(),x(),D(),m(),f(),g(),E(),v(),T(),_(),d(),S(),y(),k(),U=[{id:`profile`,label:`Profile`},{id:`notifications`,label:`Notifications`},{id:`appearance`,label:`Appearance`},{id:`account`,label:`Account`}],W=[{value:`immediately`,label:`Immediately`},{value:`daily`,label:`Daily digest`},{value:`weekly`,label:`Weekly digest`}],G=[{value:`system`,label:`System`},{value:`light`,label:`Light`},{value:`dark`,label:`Dark`}],K=[{value:`comfortable`,label:`Comfortable`},{value:`compact`,label:`Compact`}],q={name:``,email:``,displayName:``,website:``},new class extends c{static[class extends l{static{({e:[j,M,N,P,F,I,L,R,z,B,V,H],c:[J,A]}=o(this,[i(`ds-pattern-settings-page`)],[[r(),1,`savedProfile`],[r(),1,`draftProfile`],[r(),1,`pushEnabled`],[r(),1,`colorMode`],[r(),1,`density`],[r(),1,`deleteDialogOpen`]],0,void 0,l))}#e=j(this,q);get savedProfile(){return this.#e}set savedProfile(e){this.#e=e}#t=(M(this),N(this,q));get draftProfile(){return this.#t}set draftProfile(e){this.#t=e}#n=(P(this),F(this,!1));get pushEnabled(){return this.#n}set pushEnabled(e){this.#n=e}#r=(I(this),L(this,`system`));get colorMode(){return this.#r}set colorMode(e){this.#r=e}#i=(R(this),z(this,`comfortable`));get density(){return this.#i}set density(e){this.#i=e}#a=(B(this),V(this,!1));get deleteDialogOpen(){return this.#a}set deleteDialogOpen(e){this.#a=e}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Pattern.SettingsPage`)}render(){let e=this.draftProfile;return u`
      <ds-landmark role="main">
        <ds-container width="content">
          <ds-stack gap="section">
            <ds-heading level="1">Settings</ds-heading>

            <ds-tabs label="Settings sections" .tabs=${U} keep-mounted>
              <ds-tab-panel id="profile">
                <ds-form name="profile" no-error-summary @submit=${this.handleProfileSubmit}>
                  <ds-stack gap="loose">
                    <ds-fieldset legend="Your details">
                      <ds-input
                        label="Name"
                        name="name"
                        required
                        .value=${e.name}
                        @change=${e=>this.editProfile(`name`,e)}
                      ></ds-input>
                      <ds-input
                        label="Email"
                        name="email"
                        type="email"
                        required
                        description="We send receipts here."
                        .value=${e.email}
                        @change=${e=>this.editProfile(`email`,e)}
                      ></ds-input>
                    </ds-fieldset>
                    <ds-fieldset legend="Public profile">
                      <ds-input
                        label="Display name"
                        name="displayName"
                        .value=${e.displayName}
                        @change=${e=>this.editProfile(`displayName`,e)}
                      ></ds-input>
                      <ds-input
                        label="Website"
                        name="website"
                        type="url"
                        .value=${e.website}
                        @change=${e=>this.editProfile(`website`,e)}
                      ></ds-input>
                    </ds-fieldset>
                  </ds-stack>
                  <ds-stack slot="actions" direction="horizontal" gap="tight" justify="end">
                    <ds-button variant="secondary" label="Cancel" @press=${this.handleProfileCancel}></ds-button>
                    <ds-button variant="primary" type="submit" label="Save changes"></ds-button>
                  </ds-stack>
                </ds-form>
              </ds-tab-panel>

              <ds-tab-panel id="notifications">
                <ds-stack gap="loose">
                  <ds-fieldset legend="Email me about">
                    <ds-checkbox
                      name="productUpdates"
                      label="Product updates"
                      description="About once a month."
                    ></ds-checkbox>
                    <ds-checkbox name="securityAlerts" label="Security alerts" default-checked></ds-checkbox>
                    <ds-checkbox name="tips" label="Tips and tutorials"></ds-checkbox>
                  </ds-fieldset>
                  <ds-fieldset legend="Push notifications">
                    <ds-switch
                      label="Enable push notifications"
                      .checked=${this.pushEnabled}
                      @change=${this.handlePushChange}
                    ></ds-switch>
                    <ds-radio-group
                      name="pushFrequency"
                      label="Frequency"
                      .options=${W}
                      default-value="immediately"
                      ?disabled=${!this.pushEnabled}
                    ></ds-radio-group>
                  </ds-fieldset>
                </ds-stack>
              </ds-tab-panel>

              <ds-tab-panel id="appearance">
                <ds-stack gap="loose">
                  <ds-fieldset
                    legend="Theme"
                    description="A preview only: the app sets the color mode, and System means no override."
                  >
                    <ds-segmented-control
                      label="Color mode"
                      .options=${G}
                      .value=${this.colorMode}
                      @change=${this.handleColorModeChange}
                    ></ds-segmented-control>
                  </ds-fieldset>
                  <ds-fieldset legend="Density" description="A preview only: the theme has no density setting yet.">
                    <ds-radio-group
                      name="density"
                      label="Layout density"
                      description="Affects tables and lists."
                      .options=${K}
                      .value=${this.density}
                      @change=${this.handleDensityChange}
                    ></ds-radio-group>
                  </ds-fieldset>
                </ds-stack>
              </ds-tab-panel>

              <ds-tab-panel id="account">
                <ds-stack gap="loose">
                  <ds-card surface="subtle" inset="lg" heading="Export your data" heading-level="2">
                    <ds-stack gap="normal" align="start">
                      <ds-text>Download everything we store about you as a ZIP.</ds-text>
                      <ds-button variant="secondary" label="Request export"></ds-button>
                    </ds-stack>
                  </ds-card>
                  <ds-card surface="subtle" inset="lg" heading="Delete account" heading-level="2">
                    <ds-stack gap="normal" align="start">
                      <ds-alert tone="warning">This cannot be undone.</ds-alert>
                      <ds-button
                        variant="danger"
                        label="Delete account…"
                        @press=${this.handleDeleteRequest}
                      ></ds-button>
                    </ds-stack>
                  </ds-card>
                </ds-stack>
              </ds-tab-panel>
            </ds-tabs>
          </ds-stack>
        </ds-container>

        <ds-alert-dialog
          ?open=${this.deleteDialogOpen}
          tone="danger"
          heading="Delete your account?"
          description="This permanently deletes your account and everything in it. This cannot be undone."
          confirm-label="Delete account"
          @confirm=${this.closeDeleteDialog}
          @cancel=${this.closeDeleteDialog}
        ></ds-alert-dialog>
      </ds-landmark>
    `}editProfile(e,t){this.draftProfile={...this.draftProfile,[e]:t.detail.value}}handleProfileSubmit=(H(this),e=>{let t=this.draftProfile;Promise.resolve().then(()=>{this.savedProfile=t,C({message:`Changes saved`})})});handleProfileCancel=()=>{this.draftProfile=this.savedProfile};handlePushChange=e=>{this.pushEnabled=e.detail.checked};handleColorModeChange=e=>{this.colorMode=e.detail.value};handleDensityChange=e=>{this.density=e.detail.value};handleDeleteRequest=()=>{this.deleteDialogOpen=!0};closeDeleteDialog=()=>{this.deleteDialogOpen=!1}}];styles=t`
    :host {
      display: block;
    }
  `;constructor(){super(J),A()}}})))()}var X,Z,Q;function $(){return($=e((()=>{n(),Y(),X={title:`Patterns/SettingsPage`,parameters:{actions:{handles:[`submit`,`invalid`,`press`,`change`,`confirm`,`cancel`,`dismiss`]}},render:()=>u`<ds-pattern-settings-page></ds-pattern-settings-page>`},Z={},Q=[`Default`],Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{}`,...Z.parameters?.docs?.source}}}})))()}$();export{Z as Default,Q as __namedExportsOrder,X as default};