import { huffmanExampleWeights } from '../demos/huffman.js';

const topics = [
    {
        id:'ch06-basics', title:'树与二叉树的性质', short:'基本概念', icon:'tree', tone:'', blurb:'认识结点、层次和常见树形。', lead:'从父子关系读懂层次结构，再区分完全、完美与满二叉树。',
        body:`<h2>从一棵树开始</h2><p>非空树有一个根结点。其他结点各有一个双亲，孩子可以有多个。结点的度是孩子数，度为 0 的结点是叶结点。根深度为 0，树高取从根到最深结点的边数。</p><ul><li>含 <code>n</code> 个结点的非空树有 <code>n−1</code> 条边，因为每个非根结点恰好接一条来自双亲的边。</li><li>二叉树的每个结点最多两个孩子，并区分左、右。只有一个孩子时，左右也会影响结构。</li><li>第 <code>k</code> 层至多有 <code>2^k</code> 个结点，高度为 <code>h</code> 时至多有 <code>2^(h+1)−1</code> 个结点。</li></ul><h2>辨认常见树形</h2><table class="mini-table"><thead><tr><th>类型</th><th>判断条件</th></tr></thead><tbody><tr><td>完全二叉树</td><td>除末层外各层排满，末层从左连续填充。</td></tr><tr><td>完美二叉树</td><td>每一层都达到最大结点数。</td></tr><tr><td>满二叉树</td><td>按本课课件定义，每个内部结点恰有两个孩子。</td></tr></tbody></table><div class="example"><strong>叶子数怎样求？</strong><p>按度数统计，边数同时等于 <code>n₁+2n₂</code> 和 <code>n₀+n₁+n₂−1</code>，所以 <code>n₀=n₂+1</code>。</p></div>`,
        note:'做题先看根所在层的编号。这里根从 0 开始，只有根的树高为 0。若题目以层数计高度，公式里的 h 也要跟着换。', demos:['traversal']
    },
    {
        id:'ch06-storage', title:'二叉树的存储', short:'存储结构', icon:'grid', tone:'blue', blurb:'从数组下标找到左右孩子。', lead:'用同一棵树对照顺序存储和二叉链表。',
        body:`<h2>顺序存储</h2><p>以 0 为根下标，左孩子为 <code>2i+1</code>，右孩子为 <code>2i+2</code>。非根的双亲为 <code>⌊(i−1)/2⌋</code>。完全二叉树的下标紧凑，二叉堆也使用这个性质。</p><div class="example"><strong>带空位的例子</strong><p><code>[A, B, C, D, E, ∅, F]</code> 中 <code>C</code> 的左孩子下标是 5，对应空位；右孩子下标是 6，对应 <code>F</code>。</p></div><hr><h2>二叉链表</h2><p>每个结点保存数据及左右指针。空孩子用空指针表示，适合有许多空位的树。</p><pre><code>struct Node {
    char data;
    Node* left;
    Node* right;
};</code></pre><hr><h2>数组怎样转成链表？</h2><p>从下标 0 开始。越界或当前槽标记为空就返回空指针。否则创建结点，再递归构造它的左右孩子并接上指针。</p>`,
        note:'数组下标存在，并不保证这个槽里有结点。还要判断空位标记。', demos:['traversal','heap']
    },
    {
        id:'ch06-traversal', title:'遍历与重建', short:'遍历与重建', icon:'path', tone:'', blurb:'对照四种遍历，反推树形。', lead:'访问根的时机决定深度优先遍历顺序，层序遍历使用队列。',
        body:`<h2>四种遍历</h2><table class="mini-table"><thead><tr><th>遍历</th><th>访问顺序</th><th>典型实现</th></tr></thead><tbody><tr><td>前序</td><td>根、左、右</td><td>递归或显式栈</td></tr><tr><td>中序</td><td>左、根、右</td><td>递归或显式栈</td></tr><tr><td>后序</td><td>左、右、根</td><td>递归或显式栈</td></tr><tr><td>层序</td><td>从上到下、同层从左到右</td><td>先进先出队列</td></tr></tbody></table><p>每个结点只输出一次，时间为 O(n)。深度优先递归的辅助空间随树高增长，层序队列的空间随最大层宽增长。</p><pre><code>void inorder(const Node* p) {
    if (!p) return;
    inorder(p-&gt;left);
    visit(p-&gt;data);
    inorder(p-&gt;right);
}</code></pre><hr><h2>由遍历序列重建</h2><p>结点互异时，前序的首个元素或后序的末尾元素是根。用根在中序序列里切开左右子树，再按两侧的结点数切另一条序列，递归下去。一般二叉树只给前序和后序可能有多个解。</p>`,
        note:'递归进入结点与输出结点是两个动作。前序一进入就输出，中序要等左子树返回，后序要等两棵子树都返回。', demos:['traversal','rebuild']
    },
    {
        id:'ch06-heap', title:'二叉堆', short:'二叉堆', icon:'heap', tone:'amber', blurb:'观察元素如何上滤与下滤。', lead:'完全二叉树的形状加上父子大小关系，让堆顶始终是极值。',
        body:`<h2>从数组识别堆</h2><p>最大堆中每个父结点都不小于任一孩子，最小堆反之。只需比较父子，兄弟之间没有大小约束。</p><ul><li><strong>插入。</strong>先放在数组尾部，再和双亲比较，违反堆序时交换并继续向上。</li><li><strong>删除堆顶。</strong>末元素补根，和两个孩子中更符合堆序的那个比较。必要时交换并继续下滤。</li><li><strong>建堆。</strong>从最后一个非叶结点开始向前逐个下滤。对于 n≥2，起始下标是 <code>⌊n/2⌋−1</code>。</li></ul><div class="example"><strong>时间复杂度</strong><p>插入和删除堆顶每次至多走过一条根到叶的路径，都是 O(log n)。自底向上建堆为 O(n)，因为大多数结点离底部很近。</p></div>`,
        note:'下滤时先在左右孩子之间选较大值或较小值。若只有左孩子，直接用左孩子做比较。', demos:['heap']
    },
    {
        id:'ch06-huffman', title:'Huffman 树与编码', short:'Huffman 编码', icon:'bits', tone:'plum', blurb:'从频数表得到前缀编码。', lead:'每轮合并当前最轻的两棵树，用树上路径得到可逐位解码的码字。',
        body:`<h2>构造与编码</h2><ul><li>把每个符号的频数写在其叶结点上，形成候选森林。</li><li>反复取权重最小的两棵树。合并后的新根权重为两者之和，新树放回候选集合。</li><li>左边记 0，右边记 1。读根到叶的路径得到码字。解码每到一个叶子就输出符号并回根。</li></ul><p>符号全部位于叶子，保证任一码字不会成为另一码字的前缀。使用最小堆维护 k 棵候选树，构造复杂度为 O(k log k)。</p><hr><h2>计算有效码流位数</h2><p><code>WPL = Σ(频数 × 码长)</code>，也等于各轮合并权重之和。</p><div class="example"><strong>2022 A 卷频数（用字母表示符号）</strong><p><code>${huffmanExampleWeights}</code>，其中 <code>E:4</code> 表示 E 出现 4 次。四次合并权重为 11、21、32、60，WPL 为 124。原题的 60 个 4 字节整数编码前需要 1920 bit，编码后有效码流为 124 bit。</p></div>`,
        note:'同权时可以选择不同的合并顺序，码字会变，最优总代价相同。实际存文件时还需要能恢复码表的信息。', demos:['huffman']
    },
    {
        id:'ch06-forest', title:'树、森林与二叉树', short:'树与森林', icon:'forest', tone:'blue', blurb:'沿首孩子、右兄弟保存森林。', lead:'把多棵有序树放进一棵二叉树，并用遍历顺序核对转换。',
        body:`<h2>左孩子、右兄弟</h2><p>每个结点的左指针指向原树的第一个孩子，右指针指向原树的下一个兄弟。森林中各树的根也按顺序用右指针相连。</p><ul><li><strong>正向。</strong>保留双亲到首孩子的边，其余孩子按原顺序串成右兄弟链。</li><li><strong>逆向。</strong>沿二叉树根的右链分开各棵树。对每个结点，沿其左指针进入首孩子，再沿孩子的右链收集同一双亲下的其余孩子。</li></ul><h2>遍历的对应</h2><p>森林先序等于对应二叉树的前序，森林中序等于对应二叉树的中序。森林中序会先走完第一棵树的孩子，再访问根，最后才走其余树。</p><div class="example"><strong>两棵树的例子</strong><p><code>A(B,C(D))</code> 与 <code>E(F)</code>。二叉表示有 <code>A.left=B</code>、<code>B.right=C</code>、<code>C.left=D</code>、<code>A.right=E</code>、<code>E.left=F</code>。先序为 <code>A B C D E F</code>，中序为 <code>B D C A F E</code>。</p></div>`,
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
};
