![Satori](https://github.com/vercel/satori/raw/main/.github/card.png)

**Satori**：将 HTML 和 CSS 转换为 SVG 的开明之库。

> **注意**
>
> 若要在你的项目中使用 Satori 生成 PNG 图片（如 Open Graph 图片和社交分享卡片），请查看我们的[公告](https://vercel.com/blog/introducing-vercel-og-image-generation-fast-dynamic-social-card-images)以及[Vercel 的 Open Graph 图片生成文档 →](https://vercel.com/docs/og-image-generation)
>
> 若要在 Next.js 中使用，请查看 [Open Graph 图片生成示例 →](https://vercel.com/docs/og-image-generation/examples)

## 概述

Satori 支持 JSX 语法，使用起来非常直观。下面是基本用法的概览：

```jsx
// api.jsx
import satori from 'satori'

const svg = await satori(
  <div style={{ color: 'black' }}>hello, world</div>,
  {
    width: 600,
    height: 400,
    fonts: [
      {
        name: 'Roboto',
        // 使用 `fs`（仅限 Node.js）或 `fetch` 将字体读取为 Buffer/ArrayBuffer，并在此处提供 `data`。
        data: robotoArrayBuffer,
        weight: 400,
        style: 'normal',
      },
    ],
  },
)
```

Satori 会将元素渲染为 600×400 的 SVG，并返回 SVG 字符串：

```js
'<svg ...><path d="..." fill="black"></path></svg>'
```

在底层，它会处理布局计算、字体、排版等工作，生成与浏览器中完全一致 HTML 和 CSS 渲染效果的 SVG。

<br/>

## 文档

### JSX

Satori 只接受纯函数且无状态的 JSX 元素。你可以使用 HTML 元素的子集（见下文），也可以使用自定义的 React 组件，但 `useState`、`useEffect`、`dangerouslySetInnerHTML` 等 React API 不受支持。

#### 实验性：内置 JSX 支持

Satori 提供了一个实验性的 JSX 运行时，无需安装 React 即可使用。你可以通过 [`@jsxImportSource` 编译指示](https://www.typescriptlang.org/tsconfig/#jsxImportSource)按文件启用它。未来，它只会自动补全 Satori 支持的 HTML 元素和 CSS 属性的子集，以提供更好的类型安全。

```tsx
/** @jsxRuntime automatic */
/** @jsxImportSource satori/jsx */

import satori from 'satori';
import { FC, JSXNode } from 'satori/jsx';

const MyComponent: FC<{ children: JSXNode }> = ({ children }) => (
  <div style={{ color: 'black' }}>{children}</div>
)

const svg = await satori(
  <MyComponent>hello, world</MyComponent>,
  options,
)
```

#### 不使用 JSX

如果你没有启用 JSX 转译器，可以直接传入[类似 React 元素的对象](https://reactjs.org/docs/introducing-jsx.html)，它们带有 `type`、`props.children` 和 `props.style`（以及其他属性）：

```js
await satori(
  {
    type: 'div',
    props: {
      children: 'hello, world',
      style: { color: 'black' },
    },
  },
  options
)
```

### HTML 元素

由于特殊的用例，Satori 只支持 HTML 和 CSS 功能的一个有限子集。一般来说，只实现了那些静态且可见的元素和属性。

例如，`<input>` HTML 元素和 `cursor` CSS 属性不在考虑范围内。你也不能使用 `<style>` 标签，或通过 `<link>` 或 `<script>` 引用外部资源。

此外，由于 Satori 基于 [SVG 1.1 规范](https://www.w3.org/TR/SVG11)实现了自己的布局引擎，它不保证生成的 SVG 与浏览器渲染的 HTML 输出 100% 一致。

你可以在[这里](https://github.com/vercel/satori/blob/main/src/handler/presets.ts)找到受支持的 HTML 元素列表及其预设样式。

#### 图片

你可以使用 `<img>` 来嵌入图片。不过，建议设置 `width` 和 `height` 属性：

```jsx
await satori(
  <img src="https://picsum.photos/200/300" width={200} height={300} />,
  options
)
```

使用 `background-image` 时，如果未指定尺寸，图片默认会被拉伸以填满元素。

如果你想将生成的 SVG 渲染为其他图片格式（如 PNG），最好直接将 base64 编码的图片数据（或 buffer）作为 `props.src` 传入，这样 Satori 就无需额外的 I/O 操作：

```jsx
await satori(
  <img src="data:image/png;base64,..." width={200} height={300} />,
  // 或者 src={arrayBuffer}、src={buffer}
  options
)
```

### CSS

Satori 使用与 React Native 相同的 Flexbox [布局引擎](https://yogalayout.com)，但它**不是**一个完整的 CSS 实现。不过，它支持规范中涵盖大多数常见 CSS 功能的子集：

<table>
<thead>
<tr>
  <th>属性</th>
  <th>展开属性</th>
  <th>支持的值</th>
  <th>示例</th>
</tr>
</thead>
<tbody>

<tr>
<td colspan="2"><b>CSS 变量</b></td>
<td>受支持，包括 <code>--var-name</code> 声明以及带回退值的 <code>var(--var-name)</code> 用法</td>
<td><a href="https://og-playground.vercel.app/?share=rVLRTsIwFP2V5hIzTbY4wBjTIC9oos-a8MJLt95tha4lXQfOZf9uOxwRlTeeentO7zntuW0h1RyBwoyL3UoRUtlG4mPb-pqQIIpsgSVGqZbaBJQEnJlNImsMwsOJAkVeWEeM4_hqAPeC2-IXxkW1laxxaCbxY0B9_SQMplZo5TjnU5dqYJkUuXq1WFaeQmXRDNS6rqzImoV2oPL-p3TC0k1udK34wt_c8aMsy46urutNfCIl08kPaPn9lvs47tGuW6m5L3w4x2RIn4VT3DFzfZLPTeBa5i8opQ7JUhvJZ7eu8x-Jv7lqw1TuUr2E-lmJaBKSUTaNx_H4vNqwQgh668dSAW2hHynQBxcNHGYO9M5vOCZ1DjRjssIQsNRr8d5s_Zey-37ndHy4z2WCHKg1NXYhWJa4E4W333tz6L4A">示例</a></td>
</tr>

<tr>
<td colspan="2"><code>display</code></td>
<td><code>flex</code>、<code>block</code>、<code>contents</code>、<code>none</code>、<code>-webkit-box</code>，默认值为 <code>flex</code>。对于包含多个子节点的 <code>div</code> 元素，使用 <code>flex</code>、<code>contents</code> 或 <code>none</code>。</td>
<td></td>
</tr>

<tr>
<td colspan="2"><code>position</code></td>
<td><code>relative</code>、<code>static</code> 和 <code>absolute</code>，默认值为 <code>relative</code></td>
<td></td>
</tr>

<tr>
<td colspan="2"><code>color</code></td>
<td>受支持</td>
<td></td>
</tr>

<tr><td rowspan="5"><code>margin</code>（外边距）</td></tr>
<tr><td><code>marginTop</code>（上外边距）</td><td>受支持</td><td></td></tr>
<tr><td><code>marginRight</code>（右外边距）</td><td>受支持</td><td></td></tr>
<tr><td><code>marginBottom</code>（下外边距）</td><td>受支持</td><td></td></tr>
<tr><td><code>marginLeft</code>（左外边距）</td><td>受支持</td><td></td></tr>

<tr><td rowspan="5">定位（Position）</td></tr>
<tr><td><code>top</code>（上）</td><td>受支持</td><td></td></tr>
<tr><td><code>right</code>（右）</td><td>受支持</td><td></td></tr>
<tr><td><code>bottom</code>（下）</td><td>受支持</td><td></td></tr>
<tr><td><code>left</code>（左）</td><td>受支持</td><td></td></tr>

<tr><td rowspan="3">尺寸（Size）</td></tr>
<tr><td><code>width</code>（宽度）</td><td>受支持</td><td></td></tr>
<tr><td><code>height</code>（高度）</td><td>受支持</td><td></td></tr>

<tr><td rowspan="5">最小与最大尺寸（Min & max size）</td></tr>
<tr><td><code>minWidth</code>（最小宽度）</td><td>受支持，但不支持 <code>min-content</code>、<code>max-content</code> 和 <code>fit-content</code></td><td></td></tr>
<tr><td><code>minHeight</code>（最小高度）</td><td>受支持，但不支持 <code>min-content</code>、<code>max-content</code> 和 <code>fit-content</code></td><td></td></tr>
<tr><td><code>maxWidth</code>（最大宽度）</td><td>受支持，但不支持 <code>min-content</code>、<code>max-content</code> 和 <code>fit-content</code></td><td></td></tr>
<tr><td><code>maxHeight</code>（最大高度）</td><td>受支持，但不支持 <code>min-content</code>、<code>max-content</code> 和 <code>fit-content</code></td><td></td></tr>

<tr><td rowspan="5"><code>border</code>（边框）</td></tr>
<tr><td>宽度（<code>borderWidth</code>、<code>borderTopWidth</code> 等）</td><td>受支持</td><td></td></tr>
<tr><td>样式（<code>borderStyle</code>、<code>borderTopStyle</code> 等）</td><td><code>solid</code> 和 <code>dashed</code>，默认值为 <code>solid</code></td><td></td></tr>
<tr><td>颜色（<code>borderColor</code>、<code>borderTopColor</code> 等）</td><td>受支持</td><td></td></tr>
<tr><td>
  简写（<code>border</code>、<code>borderTop</code> 等）</td><td>受支持，例如 <code>1px solid gray</code><br/>
</td><td></td></tr>

<tr><td rowspan="6"><code>borderRadius</code>（圆角）</td></tr>
<tr><td><code>borderTopLeftRadius</code>（左上圆角）</td><td>受支持</td><td></td></tr>
<tr><td><code>borderTopRightRadius</code>（右上圆角）</td><td>受支持</td><td></td></tr>
<tr><td><code>borderBottomLeftRadius</code>（左下圆角）</td><td>受支持</td><td></td></tr>
<tr><td><code>borderBottomRightRadius</code>（右下圆角）</td><td>受支持</td><td></td></tr>
<tr><td>简写</td><td>受支持，例如 <code>5px</code>、<code>50% / 5px</code></td><td></td></tr>

<tr><td rowspan="4"><code>cornerShape</code>（圆角形状）</td></tr>
<tr><td>取值</td><td><code>round</code>、<code>squircle</code>、<code>square</code>、<code>bevel</code>、<code>scoop</code>、<code>notch</code> 以及 <code>superellipse()</code></td><td></td></tr>
<tr><td>角部细分属性（<code>cornerTopLeftShape</code>、<code>cornerTopRightShape</code> 等）</td><td>受支持</td><td></td></tr>
<tr><td>边简写（<code>cornerTopShape</code>、<code>cornerRightShape</code> 等）</td><td>受支持。当对应的 <code>borderRadius</code> 非零时，圆角形状才会生效。</td><td></td></tr>

<tr><td rowspan="11">Flex 弹性布局</td></tr>
<tr><td><code>flexDirection</code>（主轴方向）</td><td><code>column</code>、<code>row</code>、<code>row-reverse</code>、<code>column-reverse</code>，默认值为 <code>row</code></td><td></td></tr>
<tr><td><code>flexWrap</code>（换行）</td><td><code>wrap</code>、<code>nowrap</code>、<code>wrap-reverse</code>，默认值为 <code>nowrap</code></td><td></td></tr>
<tr><td><code>flexGrow</code>（放大比例）</td><td>受支持</td><td></td></tr>
<tr><td><code>flexShrink</code>（缩小比例）</td><td>受支持</td><td></td></tr>
<tr><td><code>flexBasis</code>（基准尺寸）</td><td>受支持，但不支持 <code>auto</code></td><td></td></tr>
<tr><td><code>alignItems</code>（交叉轴对齐）</td><td><code>stretch</code>、<code>center</code>、<code>flex-start</code>、<code>flex-end</code>、<code>baseline</code>、<code>normal</code>，默认值为 <code>stretch</code></td><td></td></tr>
<tr><td><code>alignContent</code>（多轴线对齐）</td><td>受支持</td><td></td></tr>
<tr><td><code>alignSelf</code>（自身对齐）</td><td>受支持</td><td></td></tr>
<tr><td><code>justifyContent</code>（主轴对齐）</td><td>受支持</td><td></td></tr>
<tr><td><code>gap</code>（间距）</td><td>受支持</td><td></td></tr>

<tr><td rowspan="6">字体（Font）</td></tr>
<tr><td><code>fontFamily</code>（字族）</td><td>受支持</td><td></td></tr>
<tr><td><code>fontSize</code>（字号）</td><td>受支持</td><td></td></tr>
<tr><td><code>fontWeight</code>（字重）</td><td>受支持</td><td></td></tr>
<tr><td><code>fontStyle</code>（字型）</td><td>受支持</td><td></td></tr>
<tr><td><code>fontFeatureSettings</code>（字体特性）</td><td>通过 HarfBuzz 文本整形支持。可启用连字、小型大写字母、风格集等 OpenType 特性。</td><td></td></tr>

<tr><td rowspan="13">文本（Text）</td></tr>
<tr><td><code>tabSize</code>（制表符宽度）</td><td>受支持</td><td></td></tr>
<tr><td><code>textAlign</code>（对齐）</td><td><code>start</code>、<code>end</code>、<code>left</code>、<code>right</code>、<code>center</code>、<code>justify</code>，默认值为 <code>start</code></td><td></td></tr>
<tr><td><code>textIndent</code>（首行缩进）</td><td>受支持，包括负值（悬挂缩进）</td><td></td></tr>
<tr><td><code>textTransform</code>（文本转换）</td><td><code>none</code>、<code>lowercase</code>、<code>uppercase</code>、<code>capitalize</code>，默认值为 <code>none</code></td><td></td></tr>
<tr><td><code>textOverflow</code>（溢出处理）</td><td><code>clip</code>、<code>ellipsis</code>，默认值为 <code>clip</code></td><td></td></tr>
<tr><td><code>textDecoration</code>（文本装饰）</td><td>支持线型 <code>underline</code> 和 <code>line-through</code>，以及样式 <code>dotted</code>、<code>dashed</code>、<code>double</code>、<code>solid</code></td><td><a href="https://og-playground.vercel.app/?share=pVPLTsMwEPwVaytUkAKkPCRklV4oXwDHXhx7YxtcO3Ic2hLl37GTtEKIQynywTvjndGstG6BO4FAYS70x8oSUoedwce2TTUhCrVUgZLpLM_PptlAbrQI6gcndF0ZtotsaXC7Z1O91B550M7GN-5Ms7b714oJoa2kZJaPTMH4u_SuseLJGeejYlKW5cHN2fCiP5GS25uRkqxK8gS6bmUXqUiTHMYgAbdhidx5NmawzuI0di9SMb-OzceoYiT0Ro_SAzpan5ovg4qzSdVbfCf-noIIFwIK4lH0bgM8KQ0RrFbRqjDNMNyAT8rUFAbJhHP-_1CDl5cFO8-z_lzdX_ySb39DBq5KTjXQFvoVBfqQ5xkMOwz0LgGBRSOBlszUmAGu3Zt-3VXpA4RNj6JP2rPndYECaPANdhkEVsQOhca4jfNGQPcF">示例</a></td></tr>
<tr><td><code>textShadow</code>（文字阴影）</td><td>受支持</td><td></td></tr>
<tr><td><code>lineHeight</code>（行高）</td><td>受支持</td><td></td></tr>
<tr><td><code>letterSpacing</code>（字间距）</td><td>受支持</td><td></td></tr>
<tr><td><code>whiteSpace</code>（空白处理）</td><td><code>normal</code>、<code>pre</code>、<code>pre-wrap</code>、<code>pre-line</code>、<code>nowrap</code>，默认值为 <code>normal</code></td><td></td></tr>
<tr><td><code>wordBreak</code>（换行规则）</td><td><code>normal</code>、<code>break-all</code>、<code>break-word</code>、<code>keep-all</code>，默认值为 <code>normal</code></td><td></td></tr>
<tr><td><code>textWrap</code>（文本包裹）</td><td><code>wrap</code>、<code>balance</code>，默认值为 <code>wrap</code></td><td></td></tr>

<tr><td rowspan="7">背景（Background）</td></tr>
<tr><td><code>backgroundColor</code>（背景色）</td><td>受支持，单值</td><td></td></tr>
<tr><td><code>backgroundImage</code>（背景图）</td><td><code>linear-gradient</code>、<code>repeating-linear-gradient</code>、<code>radial-gradient</code>、<code>repeating-radial-gradient</code>、<code>url</code>，单值</td><td></td></tr>
<tr><td><code>backgroundPosition</code>（背景位置）</td><td>支持单值</td><td></td></tr>
<tr><td><code>backgroundSize</code>（背景尺寸）</td><td>支持 <code>cover</code>、<code>contain</code>、<code>auto</code> 以及双值尺寸（如 <code>10px 20%</code>）</td><td><a href="https://og-playground.vercel.app/?share=ZZXXjqNIFIZfpeWb2RW9Itik3tmRwAQDJgeDNTfkHEwwYdTvvnhGWq003HDOqZ8fDlX11Y9D2Ebx4ePwNcqf35u3t2Fcq_ifHz9e8dtbFudpNn68wRD0_qsy59GY_b8Q-GGZ9u3UREbcxf4u_tK0f_U_4y-_acx8i3dF2Dajnze_jwu1n74EU1_9Efmj_5G_CmDXpH8H_hBjp_fcoVVjhiQ-ban9Ukw7Y-10j3j9ldtnyttvND6LubMHTABVrO4YJypeXGSdBtuwwCRWANMRpy7W49jmUFvuyU0fnmZeduAiZ6ZZaueUXM0V5VDBNs2OtfX6MimW0iTTBD0JeYbFeSOrpLGR5_iMkrHGYSAGEFJl77xRCsjNDC_MmIHV8KDOdsboszJAXchEZifrokEtSyrT5cUkbkifODIuyKC2oblXy8yAqyt-VLcJr8UhYJc2PGoWrW4dppebvMnexThypKZD-IRPx2dFjjnj3eAxqMU1XLTipNKFhrv-1Te3ZWE41aKHtHUogVtC98ZlniyqI9lkcOS5xQnRSlTV0-tKaHckalSGADnQlda0i12YNG7wcO3J-IrGTiWLXtviZ6tc1LDpTrmyhe5uybE1CSYwMHinsikaLkdSepmcxdufvxhlwGcYZFBUF9yqXt9fIT5MC0L3H99JUi4UOqz4PPHkFsq72zM8WjYnYGqRWukUlGh4gcFkBi7zyiOuA0c-D4-VW-zWoSnBLSFHV2qkeLMWcwGd7jWpWVCi5AgElPbN7TB1vJpQbagUW4USzTgmUwZs5ckWiKtbeoovGVYKVZYplg37_NjrsGiWVdUBSYO2HADFotULPEJ1kl-3_QMDRpkEjjNQJkq5rpYMXk6gMN14z9Nh9lIhURHsoqlSm5QUTb2sFTs1ag4JjyqDx8eRoJY24GdbW3E7mrfC2jYpulOIfsX9q8znWkYJIU1Lpl3RHbd1jvHq2hVJ27w8Hu0DQtHereC9qSlsH2pBzdY8HbMclOVBaxkCNQPbCS280YnTjDj1vRVdXk2GTcHUtcLIC2kuZmc-F0CjT5O0bxLguUZX0-46gocAOemyO9ud16EQRYoEzoUHKbUT2c6Z6iVo8ikGz_c28GlfMMZFXId-3ndkk55Y6pEpLu00ERw5DiE5ibPw6Jg0pxiXMCDPY5Xv0ooyy07SOY2ItUJA0GcAc95NKKS17ERr91XBFBjo7kTiSi-nM-MjY9_WyXH_6BRO6OxOPK9k9bA925tNd9HmcmRzKI6YXmAFWWNmoOixTTtukLU1GRFeZIuaqTM24QNH063N0Ubq86kAJkdSfl7B89Dt0_KkVXVtMRYgb4Wsogggys-O-89XYZGtuDtasBrKY6ZmsIg42314VQNix3wBqQC70a0ODgxY3BbqKvgnxsscyioJTTAUoJHSrXUiwWwtLqtAakcVCILGBrn4C1p0-WKUzlCXhIAKTFUJTXzV9zXLWaU56fX5_OfvsDy3VdvvsJyzfIy_vEY_P783376CO8u_fW8O74e2G_O2GQ4fPw4_wX34IHZwH35h_fBxeiVRHEzp4SPxqyF-P8R1W-TW2r3OhHH-me0-yc5rtg7i6PAx9lP8-X4Y_WBXZHFVtXPbV9Hh818">示例</a></td></tr>
<tr><td><code>backgroundClip</code>（背景裁剪）</td><td><code>border-box</code>、<code>text</code></td><td></td></tr>
<tr><td><code>backgroundRepeat</code>（背景重复）</td><td><code>repeat</code>、<code>repeat-x</code>、<code>repeat-y</code>、<code>no-repeat</code>，默认值为 <code>repeat</code></td><td></td></tr>

<tr><td rowspan="5"><code>transform</code>（变换）</td></tr>
<tr><td>平移（<code>translate</code>、<code>translateX</code>、<code>translateY</code>）</td><td>受支持</td><td></td></tr>
<tr><td>旋转（Rotate）</td><td>受支持</td><td></td></tr>
<tr><td>缩放（<code>scale</code>、<code>scaleX</code>、<code>scaleY</code>）</td><td>受支持</td><td></td></tr>
<tr><td>斜切（<code>skew</code>、<code>skewX</code>、<code>skewY</code>）</td><td>受支持</td><td></td></tr>

<tr>
<td colspan="2"><code>transformOrigin</code>（变换原点）</td>
<td>支持单值和双值语法（相对值和绝对值均可）</td>
<td></td>
</tr>

<tr>
<td colspan="2"><code>objectFit</code>（对象适配）</td>
<td>受支持</td>
<td><a href="https://og-playground.vercel.app/?share=7VVNj5swEP0ro6mqJFJaslJVVVbYQ6X2F_TIBewBvHVsZMwmEeK_75BAAvsl7WUPq-WC5j0P896zNLQonSIUuFxBfAttYgHyxsqgnYXf7rBsQZbaKE8WutWZB_AUGm9hq_Q91OFoKG4HBmCvVSgF3Gw26xEqSRdlmGNK15VJjwIWuaHD4oJnqfxfeNdYxdSXPM8nlPOKPMM31QFqZ7RiIWpxprvudjzXjoq7M7KNWOeJZaB_DfKXA83s2PrYzMs6L0Z_TEzNrI5gN8i46NtyrpeCS70rrhVr8DJOsAyhqkUU8XBJpTPqu3TRz83mwPOiyhYJTntOWuKW-WHYVE3ccs8Mf2pzYmjB2r9OjU59PUu67I5k-Kt7PtfGDFcyt98_0TWDaBrCh05Eunvyn5HMI7Eh1fZdQ-FMXonkhUTeK5Bapoa-Kbd_aybX3bZKbAeQWFyjq_r1XaNo8aQOxS9eUnhWg6LfWKgoawoUeWpqWiPt3J3-d6z6P0HYnyr-Ts7X9GeXkUIRfEPdGkOa8YmSjHF7543C7gE">示例</a></td>
</tr>

<tr>
<td colspan="2"><code>objectPosition</code>（对象位置）</td>
<td>支持关键字（<code>top</code>、<code>bottom</code>、<code>left</code>、<code>right</code>、<code>center</code>）、百分比（如 <code>25% 75%</code>）、长度（如 <code>10px 20px</code>）以及混合值（如 <code>left 20%</code>）。默认值为 <code>center</code>（<code>50% 50%</code>）。</td>
<td><a href="https://og-playground.vercel.app/?share=7VTBitswEP2VQaUkgbTOQilFxHsotOceevTFlsa2torGyHKTYPzvHSV24rS7Xfayp_XFzHsj6b0nMb1QpFFIsVxBeg995gDKzqlgyMFXOix7ULWx2qODYXXmATyGzjvYavMb2nC0mPYjA7A3OtQS7jab9QTVaKo63GLatI3NjxIWpcXD4oIXufpVeeqcZupdWZYzirxGz_Bdc4CWrNEsRC_O9DDcT339pHg4I9uEdZ5YBuJvlL8caWanpX-beVrnxeinmakbqxM4jDIu-rac66Xg0uyqa8UavEozUYfQtDJJ-HCFNVn9UVHyebM58HlJ46pMzNectKQ98-NhczVpz2tu8H9tzgwtWPv7udG5r0dJKh5Qhe8m8opcyI17vOUHtSa-rNiHLqAfL-82qPgl17SSeVxv2XFfQSHQ7lWz4-j-k9wTwb1Wbq3KLX7QtH8-ukAN-LjtC9O7zpBV5gaAzIm1oCbu2grZi5MPIb_wMBBn3ULGySA0Fl0lZJnbFtcCd_Rgfh6bOHHD_lTxPiXf-7ddgVrI4Dsc1iLkBXfUaC3tyVsthj8">示例</a></td>
</tr>

<tr>
<td colspan="2"><code>opacity</code>（不透明度）</td>
<td>受支持</td>
<td></td>
</tr>

<tr>
<td colspan="2"><code>boxSizing</code>（盒模型）</td>
<td>受支持</td>
<td></td>
</tr>

<tr>
<td colspan="2"><code>boxShadow</code>（盒子阴影）</td>
<td>受支持</td>
<td></td>
</tr>

<tr>
<td colspan="2"><code>overflow</code>（溢出）</td>
<td><code>visible</code> 和 <code>hidden</code>，默认值为 <code>visible</code></td>
<td></td>
</tr>

<tr>
<td colspan="2"><code>filter</code>（滤镜）</td>
<td>受支持</td>
<td></td>
</tr>

<tr>
<td colspan="2"><code>backdropFilter</code>（背景滤镜）</td>
<td>支持链式调用 <code>blur()</code>、<code>brightness()</code>、<code>contrast()</code>、<code>drop-shadow()</code>、<code>grayscale()</code>、<code>hue-rotate()</code>、<code>invert()</code>、<code>opacity()</code>、<code>saturate()</code> 和 <code>sepia()</code></td>
<td></td>
</tr>

<tr>
<td colspan="2"><code>clipPath</code>（裁剪路径）</td>
<td>支持 <code>circle()</code>、<code>ellipse()</code>、<code>inset()</code>、<code>polygon()</code>、<code>path()</code> 和 <code>shape()</code>。<code>shape()</code> 支持 <code>move</code>、<code>line</code>、<code>hline</code>、<code>vline</code>、<code>curve</code>、<code>smooth</code>、<code>arc</code> 和 <code>close</code> 命令。</td>
<td><a href="https://og-playground.vercel.app/?share=XVJNb9wgEP0rI6poW8lJnX6pstpe0h7aQ1UlrXLJBZvBZosZBDgbZ7X_PQMbZze5wPCGmXmPx1Z0pFA04osytzcOIKbZ4tftNscAA5p-SA2szuv6ZFXtwY1RaXiBKRO9lTOj2uLdgub4uwnYJUOOcx3ZaXRLVlrTu58Jx5hT6BKGJbWeYjJ6viAGXZ7_PN3K7n8faHLqgiwFzr_SWj9N5aorc48NvH93BF0_avlU1wXd7W7ctxws0l-KP8j_8FhypP4Y8lIp4_oGzg_YgSKzY6FDau2EC0WAzhr_R5Z39GTnntzrj_UJ1BU34Z3jKi_lVEGd4zerfXEmDlCoA_yLqKCdIdKIQBrSgLChYNUqgpWhx5igo9FLZzBW8Bvv0tk6AjrZWoww0wSJoAsoE4KerD2NianDNbYgvbemk9m8mGdwLbqstEyxXMHNL1F2CTTXTyFPkE6BYbP6wIV81dMGAzeGS_b0tJWZ7y95K6-6YHzi4WTzNU2hdNUylrbtZKyKZ8Wft2wQy112UQnyhZRotqL4IZrP7IfY-yWabI5Q2E69aLS0ESuBI63N39nnv5425cR98r_4MbaoRJPChLtKJNnyjQGtpfKMYvcA">示例</a></td>
</tr>

<tr>
<td colspan="2"><code>lineClamp</code>（行数限制）</td>
<td>当文本元素使用 <code>display: block</code> 时受支持。对于 WebKit 风格的截断，请使用 <code>display: -webkit-box</code> 配合 <code>WebkitLineClamp</code>。</td>
<td><a href="https://og-playground.vercel.app/?share=5VPBbtQwEP2VkRFakNKSshxQBBwoXDhwaEFc9uLYk6xbx2PZk-6G1Up8DR_GlzDOkgr13FtPGb_xvPf8ojkoQxZVo95Zd7cJAJknj-8Ph1IDbNH1W25gdVHXz1fVCdw5y9sHmHU5ej0J2nncL2ipP7mEhh0F6Rny4xCWbtTWutA3cFH_Q1ptbvtEY7CX5CnJxLOu6-7ZKPC1-4kNrF_P0PG4CR9KsZh_aP9_X60nc7tQAXgX8NLrIQrbPTjo1LvwkZhpkJF1HferU69IAcxiAN8zWmgnyDQgUAe8RdhR8naVwQsFZgZDQ9TBYa7gK-75_CYDBt16zDDRCExgEmpG6EbvzzLLy-EHtqBj9M7oElguGjKLocQ0q3iZEPIr1Iahk_kxFQUdLLjA2CcZlKuRdpiEGK7GzGetLn6_6Dt9bZKLLOIkz-8l0DSzdjrPtO3ovM3nc6KvJNJHyHa1ho368-s3vDBihQb5fVayEa-BX27UE093-apKUZxNqeag5v1Szdu6rtRpAVXzphwstmOvmk77jJXCgW7ctymW7eXdfBKesiSfhxatajiNeKwU61ZubNF7mmNUx78">示例</a></td>
</tr>

<tr><td rowspan="5">遮罩（Mask）</td></tr>
<tr><td><code>maskImage</code>（遮罩图）</td><td><code>linear-gradient(...)</code>、<code>radial-gradient(...)</code>、<code>url(...)</code></td><td><a href="https://og-playground.vercel.app/?share=pZJfb9MwFMW_imVp2ZDS5s_I1kULSMAkhgRoYlJf-uLYN8ltHTvYDm2o-t2xuxXBXvcQXed3rONj37unXAugJb0V-GulCLFuklDt92FNSAfYdq4k51manp3HT3CLwnUvmEA7SDZ52kjYnWhYf0ID3KFWXuNajr06qUxiq-4d9DZIoByYk7QercNm-qg9VOH8_-XG8x_4G0pymf-Dls9pr9L0mdaMb1qjRyW8x2jkRefcYMskwZ61YOejCrFtN-e6T4ZOOz3LinyRL65v3ubZdTZrari8KkQmbhh_jzuJdWXqWTbP51n0s1oUUdNX66GNuNFD5TP6MkXbKsvTNOK2sqatI9yhqGD60vHPHxq2fMDv67v022NbNA9vTjfqmd3ch0w-p2ECmZy1oXrLC46GSyDMkSI9C19MajlCTJxhPj8zftNfoyXUG3RfX21HkuTYBf-whhhowGMOBBXpXC_DWYfDSr1bqdvET46vNKZ6CH22tNzT44zQMrxDTJ-miJahL1RAPba0bJi0EFPo9RofpyGMoNse_7xRaOZdX4OgpTMjHGLqWO13dCCl3mojBT38AQ">示例</a></td></tr>
<tr><td><code>maskPosition</code>（遮罩位置）</td><td>受支持</td><td><a href="https://og-playground.vercel.app/?share=pVJda9swFP0rQlC3Ayf-6NKmpt5gW2Ed7KOskJe8yNK1fRNZ8iR5iRfy3yelCayFPfXBvtK5h3uP7j07yrUAWtBbgb-XihDrRgnlbhfOhLSATesKcp6l6dl5_ARuULj2BSbQ9pKNHq0lbE9oOH9CA9yhVj7HtRw6dcoyiY26d9DZkALlwJxSq8E6rMeP2oMq9H-erj3-E_9AQS7zf6DFUe1Vmh7RivF1Y_SghK8xGHnROtfbIkmwYw3Y6aCCbNtOue6SvtVOT7JZPs_n1zdv8-w6m9QVXF7NRCZuGH-PW4lVaapJNs2nWfSrnM-iuitXfRNxo_vSa_RhjDZllqdpxG1pTVNFuEVRwvil5Z8_1GzxgN9Xd-m3x2ZWP7w5vahjdn0fNHmdhglkctKE6EtecDRcAmGOzNKz8MWkkgPExBnm9TPjSc8K_dAWjxP3O-q35PA_MRZQrdF9fX1DkiSHRfnZG2KgBo9zIKhI6zr5stl_RAXafr9U75bqNvEe9JHGVPeBammxowe30SJMNKZPfqRF2DAVUA0NLWomLcQUOr3Cx7EPZnabw80XCra46yoQtHBmgH1MHas8owUp9UYbKej-Lw">示例</a></td></tr>
<tr><td><code>maskSize</code>（遮罩尺寸）</td><td>支持双值尺寸，例如 <code>10px 20%</code></td><td><a href="https://og-playground.vercel.app/?share=pVLfb9MwEP5XLEvLhpQ2P0a3LlpAAiYxJEATk_rSF8e-JNc6drAd2lD1f8duV8H6yoN19ved7j7ffTvKtQBa0HuBv5aKEOtGCeVuF-6EtIBN6wpymaXpxWV8BDcoXHuGCbS9ZKNHawnbExrun9AAd6iV57iWQ6dOLJPYqEcHnQ0UKAfmRK0G67AeP2oPqtD_NV17_Af-hoJc5_9Aixe1N2n6glaMrxujByV8jcHIq9a53hZJgh1rwE4HFWTbdsp1l_StdnqSzfJ5Pr-9e5tnt9mkruD6ZiYyccf4e9xKrEpTTbJpPs2in-V8FtVdueqbiBvdl16jD2O0KbM8TSNuS2uaKsItihLGLy3__KFmiyf8vnpIvz03s_rpzelHHbPrx6DJ6zRMIJOTJkRf8oqj4RIIc2SWXoQTk0oOEBNnmNfPjE96Veg4Gr-ffkvyvztaQLVG9_X_O5EkOWzID90QAzV4nANBRVrXyfNm52oCv98v1buluk-863ykMdV98IilxY4e_EWLMMOYHh1Ii7BTKqAaGlrUTFqIKXR6hc9jH-zrNoeXLxSM8NBVIGjhzAD7mDpW-YwWpNQbbaSg-z8">示例</a></td></tr>
<tr><td><code>maskRepeat</code>（遮罩重复）</td><td><code>repeat</code>、<code>repeat-x</code>、<code>repeat-y</code>、<code>no-repeat</code>，默认值为 <code>repeat</code></td><td><a href="https://og-playground.vercel.app/?share=nVbpjqNIEn6VkqXVzMg1AhtjQ-3MStwGA-Ywl9U_hssJ5jSHAbf63TdxdfXUzh4_FhllHF8cGZkm4usirKJ48bb4LUrvX8qXl7ab8vj3r19n-uUliVOQdG8vP61Q9G8_vb4LhzTqkr_IorStc3-C0ksejx_SmWbTJg67tCqhLqzyvig_tH6eglLs4qKdVXHZxc2H6tq3XXqZmAoKyzn-v6ovUG6mj_jtBVt_Ejnfs92i6Hdp4IcZaKq-jKCPvsl_jvzOf0sLH8RIXYK_B34bbzevqU0fjQE9CKCi4KOaVsJZAFK0PvMaQ3lwYbPiSNqzgHJV00BFqmk34XaGiEbucHlxslDqMNtRAJpyJkUpM0NTFAcXzqco6ztPUSbggs-8BTgY_AMvwl9UU9Qz_lPvPP0-WaiEz6zinkKoPwLIs9_lkGcATGEO-o6jTUANn3iKeJJ2F-6CJ58PJp8_ICFzA7QeFZqSbqHwBOW1zSeow62UY6HeAxNPzgKZnk18E7jfU2LHzbFMulBY5ZHAgVhYtUGpbGMWTT3HuHuFtZ35wLFRzyRScQ-2EDNEQkuKeaJaDM0GmJSLrNcrzGYQr5uDyFBA20vZ-VqbBuf98BkWRqGZUhXtjeGYEvcIizC5DB9yQU7niRiPpwyXH9QkP8RJdqF9unrEDo56Luig_fXD9yf_3NlVr2GRw3zye5DS01nwtp4j3SNXJ8VU_IH_eD9ygfjifEVTf2-gIVvd5TUO8-CzYC3l8rNWJOo750J-cHBfRKqB6rMf4t2-1mDsPCiN5Bn_uhk15t3umJGT79h9JPCQJ_tP9oSM_YfcP-rGwFrAPViZIUAbiH2v97P-p81BsHcJDc-ZWvGSwfHWkRZUm-8UDuWsMsJM7ITXvl8YYxpVaWIcDFuQMp-lDYZXUyUzNVLX4KYTMBgGNxwFaEUoF84QWe6mXMYz13GVeU91ISF0sPF8oDNpbYtxHVWOmSxRzOXLyHCzEenHcHk5as7liJUdRl2SjhWUE3PZ2gdM43nDPrEUGwnJxHISvL6WuHksd8qjuK66bTDEQyKKHu5qIGNFxvAo5byyizvKZ1y7x28hf-CjZXAw2EGzWn_bP04b2lbtMx3Y0jpXaDNktVtXbPH7o8A3k8q5jhVNxsBWhe0F8jqqYqJnr17XAO9o1UZrAcDRo3tY7Zc5wGhikM4Wilz3YTH1akMOy1XMMGOVEZokexWWlo7HMrJ4mBzVqM7u8aSyN7SWb870cAKdUCqJ6c2z3xr6gV61QqrD22-O_pRosq3iHQHGzFRQ5Yisjo61Tseq0VByWxKmdVrHa9fRk122bBpiUHnDCTG_OR28OudwcW0E4qGozUaOdnHZRLesiUbXkbg1bku7lGdSrNTYBlHqgxtVdr9RjvZyd8xXd4BUYBvou7VvXLoxGkldoSrXdvmzRHnurQiLi9WfDPsgi_dJE5cB4pIZG6gaVm1qkrxQVSUqZU3d0bDMtxfdU3kSiVwJKVrPXy8HaWAJzNBDjq4entTprFOeWL32HNwX1u2dXVfSQJQeeyMecFNHn6ezUUmaO9md4uaKL3twybpTNuQ1QYGym8gitAjRu7DoFaQkWHI7miNzZ2UUsuEE2LlmjNrpp5XTh3mM-eXt_mi2O1kor9tBsfwbxgILhzkJ68PRPh25nlhRkxTTuWQq6dWVpp3BVPWq6ree34P7ivDPAljuwsQbB8fxjnTSn-lsx7sPMdwQe48zB3lI0rI02Vgz2kBmsColkI3M3QuwOSUEzZuCd99fNIykkP0YINFwL6LNUiQmKiAPoo5PqkVFGc1fEaQtxrW6psdO4C5IhRxC1916J3mrxeDerWKcRC_0etLjCiR7IexI2eG0w57VB4S0zd53hq0xZI7sNuqZ2ka4KhmHvBQke2sbO_gn013TtlADlAmPyZEcSqsdVrqFl8IbmAgqnY9pFukjifCFN1mcGPOEFPsIAi-V0rgqfdMZSlIkpEGa4ua3J44SQ4thMqQRr8ujjuxUKgCIq3Iaheg6fbOvF2qN895725IMC-eaTAIA_P77Lx_NvfDbTJw79NvLH3laxn7zK2j8KIUTwM9d9dLMPf71Jcj7-PWla_yyrf0G6n7545P9-3AwTyj1-LJaz8tn90Zcx_48VjRP4tcfSicOsrRTPmXwl6GhvYPlWOQfg4O2V9fnicZ8x0B92OyOLDWIKV2dnbz097B5XMGgMCKICnsK1_MHGk0VczNCzBp-2DG9IDeaKQ4iSwHlJEIsNSrXp49N4Ix9-PjUXGCjiyYcUyb8HhbhfcYpDPmIijDVruPguUYlCjBmho4KMzxUk6Yhpn2-zDDILNeqJ0g_LKDDWDI7v0_dKLMZpJWVyHM45NeqOazgikMfhgJt1KvVzuts66QiOBd5G8D9RuukjgQrFRliCZvOnMvyx0H8ezH_n-P808v_ONQ_Qf_laL99-1L-40v5GwLHXLguXhdVPQ-l7eLt6-I50C7eZpevi_eRd_E2D5GLKA56sHi7-Hkbvy7iorqmp6me5-VueHLQ0Tx5ckUQR4u3runjb6-Lzg8gIonzvBqqJo8W3_4J">示例</a></td></tr>

<tr>
<td rowspan="2"><code>WebkitTextStroke</code>（文字描边）
<td><code>WebkitTextStrokeWidth</code>（描边宽度）</td>
<td>受支持</td>
<td></td>
</tr>
<tr>
<td><code>WebkitTextStrokeColor</code>（描边颜色）</td>
<td>受支持</td>
<td></td>
</tr>

</tbody>
</table>

注意：

1. 不支持三维变换。
2. SVG 中不支持 `z-index`。文档中靠后的元素会被绘制在更上层。
3. 不支持 `calc`。
4. `currentColor` 仅对 `color` 属性可用。
5. 支持 CSS 变量（自定义属性），包括继承、回退值以及嵌套变量。

### 语言与排版

**OpenType 特性**：Satori 通过 HarfBuzz 文本整形支持高级排版特性。使用 `font-feature-settings` CSS 属性可启用以下 OpenType 特性：
- 连字（`liga`、`dlig`、`hlig`）
- 小型大写字母（`smcp`、`c2sc`）
- 风格集（`ss01`-`ss20`）
- 上下文替代字形（`calt`）
- 花饰体（`swsh`、`cswh`）
- 以及更多 OpenType 特性

示例：
```jsx
<div style={{ fontFeatureSettings: '"smcp" 1, "liga" 0' }}>
  This Text Uses Small Caps
</div>
```

HarfBuzz 还能改善阿拉伯语等复杂文字的字形整形。目前尚不支持完整的 Unicode 双向排版，因此混排的从左到右（LTR）和从右到左（RTL）文本可能不会遵循浏览器的顺序。

#### 字体

Satori 目前支持三种字体格式：TTF、OTF 和 WOFF。请注意，目前不支持 WOFF2。如果要用 Satori 渲染任何文本，你必须指定字体，并将字体数据作为 ArrayBuffer（Web）或 Buffer（Node.js）传入：

```js
await satori(
  <div style={{ fontFamily: 'Inter' }}>Hello</div>,
  {
    width: 600,
    height: 400,
    fonts: [
      {
        name: 'Inter',
        data: inter,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Inter',
        data: interBold,
        weight: 700,
        style: 'normal',
      },
    ],
  }
)
```

可以向 Satori 传入多个字体，并在 `fontFamily` 中使用它们。

> [!TIP]
> 如果字体不发生变化，建议定义全局字体，而不是每次新建对象传入 satori，以获得更好的性能。[点击此处了解详情](https://github.com/vercel/satori/issues/590)

#### Emoji

要为特定的字位（grapheme）渲染自定义图片，可以使用 `graphemeImages` 选项将字位映射到图片源：

```jsx
await satori(
  <div>Next.js is 🤯!</div>,
  {
    ...,
    graphemeImages: {
      '🤯': 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f92f.svg',
    },
  }
)
```

图片会被调整为当前字号（宽和高相等）的正方形。

#### 语言区域

Satori 支持以不同的语言区域渲染文本。你可以通过 `lang` 属性指定受支持的语言区域：

```jsx
await satori(
  <div lang="ja-JP">骨</div>
)
```

相同的字符在不同的语言区域中可能渲染出不同的效果，必要时你可以指定语言区域，强制其使用特定的字体和区域进行渲染。查看[此示例](https://og-playground.vercel.app/?share=nVLdSsMwFH6VcEC86VgdXoyweTMVpyiCA296kzWnbWaalCZ160rfwAcRH8Bn0rcwWVdQEYTdnJzz_ZyEnNNArDkChQkXz5EixNha4rRpfE4IF6aQrKbkOJG4OQ461OfnosTYCq0cF2tZ5apnMxRpZh18EoZHPbgW3Ga_sIJxLlS6Q4sNGbnQU0yKVM0t5sa3R2Wx7KlVZaxI6pl2oPLX_KQTh1-yXEj_6LlnAhLBLXOJYJLMY61MBN_VD2KLlIzGe2jJ4qe01JXiMy116bqsM2Gxc7Stj2edcmIKpohkKp1GsGKD6_sI9hQhn2-vHy_ve-HQK_9ybbPB7O4Q1-LxENfVzX-uydDtgTshAF348RqgDeymB3QchgF04wV66guOyyoFmjBpMADM9Uos6sLvk13vKtfH__FFvkQO1JYVtu0X)了解更多。

受支持的语言区域以 `Locale` 枚举类型导出。

#### 动态加载 Emoji 与字体

Satori 支持动态加载 emoji 图片（字位图片）和字体。当某个文本片段被渲染但缺少图片或字体时，会调用 `loadAdditionalAsset` 函数：

```jsx
await satori(
  <div>👋 你好</div>,
  {
    // `code` 为检测到的语言代码，若为 Emoji 则为 `emoji`，无法判断时为 `unknown`。
    // `segment` 为要渲染的内容。
    loadAdditionalAsset: async (code: string, segment: string) => {
      if (code === 'emoji') {
        // 如果 segment 是 emoji
        return `data:image/svg+xml;base64,...`
      }

      // 如果 segment 是普通文本
      return loadFontFromSystem(code)
    }
  }
)
```

### 运行时支持

Satori 可直接在浏览器、Node.js（>= 16）和 Web Worker 中使用。它会将底层的 WASM 依赖以 base64 编码字符串的形式打包，并在运行时加载。

如果存在动态加载 WASM 的限制（例如 Cloudflare Workers），可以使用下文提到的独立构建（Standalone Build）。

#### Satori 的独立构建

Satori 的独立构建默认不包含 Yoga 的 WASM 二进制文件，你需要在使用 Satori 之前手动加载它。

首先，你需要从 [Satori 构建](https://unpkg.com/satori/)下载 `yoga.wasm` 二进制文件并自行提供。下面以使用 `fetch` 直接从 CDN 加载为例：

```jsx
import satori, { init } from 'satori/standalone'

const res = await fetch('https://unpkg.com/satori/yoga.wasm')
const yogaWasm = await res.arrayBuffer()

await init(yogaWasm)

// 现在你可以像往常一样使用 satori
const svg = await satori(...)
```

当然，你也可以通过 Node.js 中的 `fs.readFile` 或其他方式从本地磁盘加载 `yoga.wasm` 文件。

### 字体嵌入

默认情况下，Satori 将文本渲染为 SVG 中的 `<path>`，而不是 `<text>`。这意味着它会将字体的路径数据作为内联信息嵌入，因此后续流程（例如在其他平台上渲染 SVG）不再需要处理字体文件。

你可以通过将 `embedFont` 设置为 `false` 来关闭此行为，此时 Satori 会使用 `<text>`：

```jsx
const svg = await satori(
  <div style={{ color: 'black' }}>hello, world</div>,
  {
    ...,
    embedFont: false,
  },
)
```

### 像素网格取整

设置 `pointScaleFactor` 可控制布局值取整到像素网格的方式。该参数直接传递给 [Yoga 的 `pointScaleFactor`](https://www.yogalayout.dev/docs/getting-started/configuring-yoga#point-scale-factor)，可提高在高 DPI 显示屏上的渲染精度。

```jsx
const svg = await satori(
  <div style={{ color: 'black' }}>hello, world</div>,
  {
    ...,
    pointScaleFactor: 2,
  },
)
```

### 调试

要绘制用于调试的包围盒，可以将 `debug: true` 作为选项传入：

```jsx
const svg = await satori(
  <div style={{ color: 'black' }}>hello, world</div>,
  {
    ...,
    debug: true,
  },
)
```

<br/>

## 贡献

你可以使用 [Vercel OG Image Playground](https://og-playground.vercel.app/) 来测试和报告 Satori 的 Bug。在提交 Pull Request 之前，请遵循我们的[贡献指南](https://github.com/vercel/satori/blob/main/CONTRIBUTING.md)。

<br/>

## 作者

- Shu Ding（[@shuding](https://twitter.com/shuding)）

---

<a aria-label="Vercel logo" href="https://vercel.com">
  <img src="https://badgen.net/badge/icon/Made%20by%20Vercel?icon=zeit&label&color=black&labelColor=black">
</a>
