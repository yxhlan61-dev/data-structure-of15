import { huffmanExampleWeights } from '../demos/huffman.js';
import { treeCode } from './tree-code.js';
import { heapCode } from './heap-code.js';

const topics = [
    {
        id:'ch06-basics', title:'树与二叉树的性质', short:'基本概念', icon:'tree', tone:'', blurb:'认识结点、层次和常见树形。', lead:'从父子关系读懂层次结构，再区分完全、完美与满二叉树。',
        body:`<h2>树的递归定义</h2>
        <p>树是由有限个结点组成的层次结构。没有结点的是空树。非空树有且只有一个根，其余结点划分成若干棵互不相交的子树，各子树的根都是原树根的孩子。任意非根结点恰有一个双亲。</p>
        <h2>术语清单</h2>
        <p>以右图为例，A 的孩子依次为 B、C、D；B 的孩子为 E、F；C 的孩子为 G。</p>
        <table class="mini-table"><thead><tr><th scope="col">术语</th><th scope="col">定义与例子</th></tr></thead><tbody>
        <tr><td>根、双亲、孩子</td><td>A 是根，根没有双亲。B 是 E 的双亲，E 是 B 的孩子。</td></tr>
        <tr><td>兄弟、堂兄弟</td><td>双亲相同的 E、F 是兄弟。同层、双亲不同的 E、G 是堂兄弟。</td></tr>
        <tr><td>结点的度（Degree）</td><td>该结点的孩子数，也就是它拥有的非空子树数。B 的度为 2，C 的度为 1。</td></tr>
        <tr><td>叶结点（Leaf）</td><td>也称终端结点，度为 0。图中 D、E、F、G 是叶结点。</td></tr>
        <tr><td>分支结点</td><td>也称内部结点或非终端结点，度大于 0。图中为 A、B、C。</td></tr>
        <tr><td>树的度</td><td>所有结点度的最大值。A 有 3 个孩子，图中树的度为 3。</td></tr>
        <tr><td>路径、路径长度</td><td>由连续的父子关系连接的结点序列。A → B → E 有 2 条边，长度为 2。</td></tr>
        <tr><td>祖先、子孙</td><td>A、B 都是 E 的祖先；E、F 都是 B 的子孙。这里列的是严格祖先与子孙，不含结点自身。</td></tr>
        <tr><td>层次、深度</td><td>从根到结点的路径长度。课件规定根为第 0 层，G 在第 2 层。</td></tr>
        <tr><td>树的高度、宽度</td><td>高度取最大层次，图中为 2；宽度取单层最多的结点数，图中为 3。高度为 2 的树共有 3 层。</td></tr>
        <tr><td>子树、森林</td><td>以 B 为根的子树包含 B、E、F。森林是若干棵互不相交的树，删去 A 后得到以 B、C、D 为根的森林。</td></tr>
        <tr><td>有序树、无序树</td><td>有序树的各结点须保持孩子的先后顺序，交换 B 和 C 会改变这棵有序树；无序树对孩子顺序不作要求。</td></tr>
        </tbody></table>
        <p>树的常见操作包括判空、定位结点、取双亲或孩子、插入或删除子树，以及遍历。非空树有 n−1 条边，结点度数之和也为 n−1，因为每条边恰好对应一个非根结点的双亲关系。</p>
        <h2>二叉树与特殊形态</h2>
        <p>二叉树可以为空；非空时由根、左子树、右子树组成，左、右子树均可为空。只有一个孩子时，也必须说明它是左孩子还是右孩子。</p>
        <table class="mini-table"><thead><tr><th scope="col">类型</th><th scope="col">识别条件</th></tr></thead><tbody>
        <tr><td>完美二叉树</td><td>每一层都达到最大结点数，所有叶子同层。</td></tr>
        <tr><td>完全二叉树</td><td>末层以外都满，末层从左连续填充。按层编号中间无空位。</td></tr>
        <tr><td>满二叉树</td><td>按本课定义，每个分支结点恰有两个孩子。叶子可以出现在不同层。</td></tr>
        <tr><td>扩充二叉树</td><td>把每个空子树的位置补成一个外部叶结点，使原结点都有两个孩子。</td></tr>
        <tr><td>斜树</td><td>每个分支仅有一个孩子。n 个结点的斜树高度为 n−1。</td></tr>
        </tbody></table>
        <h2>公式与推导</h2>
        <ul><li>根为第 0 层时，第 k 层至多有 <code>2^k</code> 个结点，高度 h 的二叉树至多有 <code>2^(h+1)−1</code> 个结点。</li>
        <li>n&gt;0 的完全二叉树高度为 <code>⌊log₂ n⌋</code>。例如 n=10 时高度为 3，共 4 层。</li>
        <li>记 n₀、n₁、n₂ 为度为 0、1、2 的结点数。由 <code>n₁+2n₂ = n₀+n₁+n₂−1</code> 得 <code>n₀=n₂+1</code>。满二叉树的叶数因此比分支数多 1。</li>
        <li>有 n 个结点的非空二叉树共有 2n 个孩子位置，其中 n−1 个接真实孩子，所以有 n+1 个空位置。扩充后增加 n+1 个外部叶结点。</li></ul>
        <div class="example"><strong>自测</strong><p>右图的树和二叉树有何区别？A 的度是 3，因此右图是一棵普通树。若某棵二叉树的度为 2 的结点有 7 个，则它一定有 8 个叶结点。</p></div>`,
        note:'做题先看根所在层的编号。这里根从 0 开始，只有根的树高为 0。若题目以层数计高度，公式里的 h 也要跟着换。', demos:['traversal']
    },
    {
        id:'ch06-storage', title:'二叉树的存储', short:'存储结构', icon:'grid', tone:'blue', blurb:'从数组下标找到左右孩子。', lead:'用同一棵树对照顺序存储和二叉链表。',
        body:`<h2>顺序存储</h2>
        <p>把结点放到与完全二叉树层序编号对应的位置。普通二叉树要保留中间空槽，完全二叉树可连续存放。</p>
        <table class="mini-table"><thead><tr><th scope="col">关系</th><th scope="col">根下标为 0</th><th scope="col">根下标为 1</th></tr></thead><tbody><tr><td>左孩子</td><td><code>2i+1</code></td><td><code>2i</code></td></tr><tr><td>右孩子</td><td><code>2i+2</code></td><td><code>2i+1</code></td></tr><tr><td>非根的双亲</td><td><code>⌊(i−1)/2⌋</code></td><td><code>⌊i/2⌋</code></td></tr></tbody></table>
        <p>计算出孩子下标后先判断越界，再判断空位。0 基的完全二叉树中，叶子下标为 <code>⌊n/2⌋</code> 到 <code>n−1</code>。右侧示例数组为 <code>[A, B, C, D, E, ∅, F]</code>，C 的左槽下标是 5，右槽下标是 6。</p>
        <p>顺序存储可 O(1) 计算相邻位置，适合完全二叉树。一路向右的斜树会留下大量空槽，最深结点的下标随深度指数增长。</p>
        <h2>二叉链表、三叉链表</h2>
        <p>二叉链表每个结点保存数据和左右孩子指针，缺孩子时填空指针。三叉链表再加一个双亲指针，根的双亲为空。它可直接找双亲，但插入和删除时也要维护该指针。</p>
        <pre><code>typedef struct Node {
            char data;
            struct Node *left;
            struct Node *right;
        } Node;</code></pre>
        <h2>怎样建立链表</h2>
        <ol><li>由带空位的顺序数组建立。从根下标开始，越界或遇到空槽就返回空指针；否则创建结点，再处理两个孩子下标。空双亲下的非空槽表示输入不合法。</li>
        <li>由带空标记的前序序列建立。依次读一个标记；遇到 <code>#</code> 返回空，否则创建根，递归读左、右子树。单凭带空标记的前序就能恢复树形。</li></ol>
        <div class="example"><strong>手算空指针</strong><p>示例有 6 个结点和 5 条孩子链接，因此左右指针域共 12 个，其中 7 个为空。</p></div>`,
        note:'数组下标存在，并不保证这个槽里有结点。还要判断空位标记。', demos:['traversal','heap']
    },
    {
        id:'ch06-traversal', title:'遍历与重建', short:'遍历与重建', icon:'path', tone:'', blurb:'对照四种遍历，反推树形。', lead:'访问根的时机决定深度优先遍历顺序，层序遍历使用队列。',
        body:`<h2>四种遍历</h2>
        <p>遍历要求每个结点恰好被访问一次。前、中、后序是深度优先；层序是广度优先。下列序列均以右侧示例树为准。</p>
        <table class="mini-table"><thead><tr><th scope="col">方式</th><th scope="col">次序</th><th scope="col">示例输出</th></tr></thead><tbody>
        <tr><td>前序</td><td>根、左、右（NLR）</td><td><code>A B D E C F</code></td></tr><tr><td>中序</td><td>左、根、右（LNR）</td><td><code>D B E A C F</code></td></tr><tr><td>后序</td><td>左、右、根（LRN）</td><td><code>D E B F C A</code></td></tr><tr><td>层序</td><td>由浅到深，同层从左到右</td><td><code>A B C D E F</code></td></tr></tbody></table>
        <h2>实现与典型应用</h2>
        <ul><li>递归写法先判空，再递归处理左右子树。调整访问根的位置即可切换三种深度优先遍历。</li>
        <li>非递归深度优先用显式栈保存回退路径；后序需要判定右子树是否处理完。层序用先进先出的队列。</li>
        <li>求结点总数用 <code>1 + count(left) + count(right)</code>。求叶数时，空树贡献 0，左右都空的结点贡献 1，其他结点汇总两侧叶数。</li>
        <li>以边数计高度时，递归可取空树为 −1，非空树为 <code>1 + max(height(left), height(right))</code>。按层数计高度时，空树取 0。</li>
        <li>遍历时间均为 O(n)。深度优先辅助空间量级随树高增长，层序随最大层宽增长。</li></ul>
        <p><a class="secondary" href="#code">练习手写二叉树非递归遍历</a></p>
        <h2>由序列重建二叉树</h2>
        <ol><li>结点互异时，取前序首项或后序末项为根。</li><li>在中序中定位根，左边是左子树，右边是右子树。</li><li>按两侧结点数切分其余前序或后序，再对子区间递归。空区间对应空树。</li></ol>
        <div class="example"><strong>分割示例</strong><p>前序 <code>A B D E C F</code>、中序 <code>D B E A C F</code>。A 左侧在中序有 3 项，因此 A 后的 <code>B D E</code> 属于左子树，<code>C F</code> 属于右子树。只有前序 A B 和后序 B A 时，B 可能是 A 的左孩子，也可能是右孩子。</p></div>
        <details><summary>线索二叉树（复习范围标为不考）</summary><p>利用空指针保存某种遍历次序下的前驱或后继，并用标志位区分孩子指针和线索。中序线索化时，可按中序扫描，用 pre 保存上一个结点。当前左指针为空时填前驱；上一个结点的右指针为空时填后继。</p></details>`,
        note:'递归进入结点与输出结点是两个动作。前序一进入就输出，中序要等左子树返回，后序要等两棵子树都返回。', demos:['traversal','rebuild']
    },
    {
        id:'ch06-heap', title:'二叉堆', short:'二叉堆', icon:'heap', tone:'amber', blurb:'观察元素如何上滤与下滤。', lead:'完全二叉树的形状加上父子大小关系，让堆顶始终是极值。',
        body:`<h2>堆的两个条件</h2>
        <ol><li>形状是完全二叉树，按层顺序紧凑存入数组。</li><li>最大堆中，任一双亲不小于它的孩子；最小堆中，任一双亲不大于它的孩子。左右兄弟没有大小约束。因此堆顶是极值，堆数组通常仅满足局部大小关系。</li></ol>
        <h2>三种操作</h2>
        <table class="mini-table"><thead><tr><th scope="col">操作</th><th scope="col">手算步骤</th><th scope="col">时间</th></tr></thead><tbody>
        <tr><td>插入</td><td>新值放数组尾部。比较它和双亲，违反堆序时交换并继续上滤。</td><td>O(log n)</td></tr>
        <tr><td>删除堆顶</td><td>保存堆顶，末项补根，缩小堆。最大堆下滤时优先选较大的孩子，最小堆选较小的孩子。只有左孩子时直接比较它。</td><td>O(log n)</td></tr>
        <tr><td>建堆</td><td>0 基数组从最后一个非叶下标 <code>⌊n/2⌋−1</code> 开始，向前对每个结点下滤。n&lt;2 时无需调整。</td><td>O(n)</td></tr></tbody></table>
        <p>自底向上建堆先保证当前结点的两棵子树分别满足堆序。层数越深的结点越多，但能下滤的距离越短。若用逐个插入建堆，最坏时间为 O(n log n)。</p>
        <div class="example"><strong>手推最大堆</strong><p>在 <code>[10,5,8,4,1,3]</code> 中插入 12，先与下标 2 的 8 交换，再与根 10 交换，得到 <code>[12,5,10,4,1,3,8]</code>。若在原堆中删除 10，3 补根，再用 8 下滤，得到 <code>[8,5,3,4,1]</code>。</p></div>
        <p><a class="secondary" href="#code/heap">练习手写最大堆维护</a></p>`,
        note:'下滤时先在左右孩子之间选较大值或较小值。若只有左孩子，直接用左孩子做比较。', demos:['heap']
    },
    {
        id:'ch06-huffman', title:'Huffman 树与编码', short:'Huffman 编码', icon:'bits', tone:'plum', blurb:'从频数表得到前缀编码。', lead:'每轮合并当前最轻的两棵树，用树上路径得到可逐位解码的码字。',
        body:`<h2>路径、权值与带权路径长度</h2>
        <p>根到叶子的路径长度等于边数。某个叶子的带权路径长度等于它的权值乘路径长度。全树的 WPL 是所有叶子带权路径长度之和。对固定的一组叶权，Huffman 树使 WPL 最小。</p>
        <h2>构造与编码</h2>
        <ol><li>每个符号及其频数构成一棵单结点树。</li><li>每轮从<strong>当前候选</strong>取权重最小的两棵树，合并成新根，根权取两权之和，再将新树放回。</li><li>只剩一棵时结束。k 种符号共合并 k−1 次，得到 k 个叶子和 k−1 个新根。</li><li>约定左边为 0、右边为 1。从根到叶的比特串就是码字。解码按位走，走到叶就输出符号并回根。</li></ol>
        <p>每个码字都在叶子结束，任何码字均不会成为另一个码字的前缀。若候选权值相同，可以有不同的最优合并顺序或码字。用最小堆维护候选树，构造耗时 O(k log k)。</p>
        <h2>计算有效码流位数</h2>
        <p>当权重是频数时，<code>WPL = Σ(频数 × 码长)</code>，也等于各轮合并权重之和。单符号只有根，理论树 WPL 为 0；若约定实际编码为一位 <code>0</code>，实际码流位数等于符号频数。</p>
        <div class="example"><strong>2022 A 卷频数（用字母表示符号）</strong><p><code>${huffmanExampleWeights}</code>，其中 <code>E:4</code> 表示 E 出现 4 次。合并权重依次为 11、21、32、60，WPL 为 124。动画的码字为 <code>A→0，B→110，C→111，D→101，E→100</code>。原题 60 个 4 字节整数占 <code>60×32=1920</code> 位，编码后有效码流为 124 位。保存完整压缩文件还要考虑码表等开销。</p></div>`,
        note:'同权时可以选择不同的合并顺序，码字会变，最优总代价相同。实际存文件时还需要能恢复码表的信息。', demos:['huffman']
    },
    {
        id:'ch06-forest', title:'树、森林与二叉树', short:'树与森林', icon:'forest', tone:'blue', blurb:'沿首孩子、右兄弟保存森林。', lead:'把多棵有序树放进一棵二叉树，并用遍历顺序核对转换。',
        body:`<h2>树和森林如何存储</h2>
        <ul><li><strong>双亲表示法。</strong>用数组为每个结点记录双亲下标，根用特殊值标记。找双亲直接，列出全部孩子通常需要扫描。</li><li><strong>孩子表示法。</strong>为每个结点建立孩子表，方便顺着表找孩子。</li><li><strong>孩子兄弟表示法。</strong>每个结点只存两个指针，左指针指第一个孩子，右指针指下一个兄弟。各棵树的根按森林顺序接到同一条右链。</li></ul>
        <h2>两种表示互相转换</h2>
        <ol><li><strong>一般树转二叉树。</strong>把同一双亲的孩子按顺序用右指针串联。双亲的左指针只指第一个孩子。单棵树转换后，该树根没有右兄弟。</li><li><strong>森林转二叉树。</strong>每棵树分别转换，再按顺序串联各树根，第一棵树的根作为二叉树根。</li><li><strong>二叉树还原森林。</strong>沿二叉树根的右链取出各树根；对每个结点，沿左指针找到第一个孩子，再沿这个孩子的右链收集其他孩子。</li></ol>
        <h2>遍历对应</h2>
        <table class="mini-table"><thead><tr><th scope="col">树或森林的顺序</th><th scope="col">相应二叉序列</th></tr></thead><tbody><tr><td>树先根、森林先序</td><td>前序</td></tr><tr><td>树后根、森林中序</td><td>中序</td></tr></tbody></table>
        <p>森林先序访问第一棵树的根、根的孩子森林、剩余森林；森林中序先处理第一棵树根的孩子森林，再访问根，最后处理剩余森林。</p>
        <div class="example"><strong>两棵树的例子</strong><p>森林为 <code>A(B,C(D))</code> 与 <code>E(F)</code>。二叉表示中 <code>A.left=B</code>、<code>B.right=C</code>、<code>C.left=D</code>、<code>A.right=E</code>、<code>E.left=F</code>。先序为 <code>A B C D E F</code>，中序为 <code>B D C A F E</code>。</p></div>`,
        note:'右指针在这个表示中指原树的兄弟。还原的时候，别把这条边读成原树的“右孩子”。', demos:['forest']
    }
];

const demoInfo = [
    {id:'traversal', title:'二叉树遍历', icon:'path', tone:'', topicId:'ch06-traversal', desc:'用访问顺序、调用栈和队列对照四种遍历。'},
    {id:'rebuild', title:'由序列重建二叉树', icon:'split', tone:'blue', topicId:'ch06-traversal', desc:'定位根结点，分割中序区间，逐步长出左右子树。'},
    {id:'heap', title:'二叉堆调整', icon:'heap', tone:'amber', topicId:'ch06-heap', desc:'同时观察数组和树，跟踪比较、交换、上滤与下滤。'},
    {id:'huffman', title:'Huffman 编码', icon:'bits', tone:'plum', topicId:'ch06-huffman', desc:'从逐轮合并到 0/1 编码，计算带权路径长度。'},
    {id:'forest', title:'树与森林转换', icon:'forest', tone:'blue', topicId:'ch06-forest', desc:'在森林关系与二叉指针之间来回转换。'}
];

export const treesChapter = {
    number: '06',
    title: '树与二叉树',
    intro: '从一棵树的基本结构出发，掌握遍历、二叉堆、Huffman 编码和森林转换。',
    topics,
    demos: demoInfo,
    code: treeCode,
    heapCode,
};
