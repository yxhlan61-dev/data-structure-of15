// 每个 lesson 的声明、函数和 driver 可组合为独立 C11 程序。
const includes = '#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <limits.h>\n#include <assert.h>\n';
const lesson = (id,title,description,complexity,reasoning,code,driver,trace,declarations='') => ({id,title,description,complexity,declarations:includes+declarations,steps:[{title:'实现与关键步骤',reasoning,code,trace}],driver:'int main(void) {\n'+driver+'\n    return 0;\n}'});

export const codeLessons = {
'01': [lesson('count','循环计数与递归求和','把循环边界转化为求和式；递归显式检查输入。','三角循环 Θ(n²) 时间、O(1) 空间；递归 sum Θ(n) 时间/栈空间。','三角循环第 i 轮执行 i 次；递归先处理 n=0 基例。示例限制 n≤100，避免整数溢出和过深递归。',String.raw`long long triangle(int n) {
    long long count=0;
    for (int i=1;i<=n;i++)
        for (int j=0;j<i;j++) count++;
    return count;
}
int sum(int n) { return n==0 ? 0 : n+sum(n-1); }`,'    assert(triangle(4)==10); assert(sum(4)==10);','n=4，基本操作 1+2+3+4=10，递归从 4 下降到 0 再逐层返回。')],
'02': [
lesson('array-list','顺序表插入和删除','p 是 0 基下标；失败返回 0，不修改表。','最坏 O(n) 时间，O(1) 辅助空间。','插入从后往前移动；删除从前往后填补。n 指向有效长度，数组容量单独传入。',String.raw`int insert(int a[],int *n,int cap,int p,int x) {
    if (*n<0 || *n>=cap || p<0 || p>*n) return 0;
    for (int j=*n;j>p;j--) a[j]=a[j-1];
    a[p]=x; ++*n; return 1;
}
int erase(int a[],int *n,int p,int *out) {
    if (p<0 || p>=*n) return 0;
    *out=a[p];
    for (int j=p;j+1<*n;j++) a[j]=a[j+1];
    --*n; return 1;
}`,'    int a[4]={1,3},n=2,x; assert(insert(a,&n,4,1,2)); assert(a[1]==2); assert(erase(a,&n,0,&x)&&x==1); assert(!erase(a,&n,2,&x));','[1,3] 在 p=1 插 2 → [1,2,3]；删 p=0 → [2,3]。'),
lesson('singly','单链表插删、反转和有序合并','带头结点，插删操作接收已定位的前驱。','已定位插删 O(1)；反转 O(n)；合并 O(m+n)；迭代辅助空间 O(1)。','先保存旧后继再改链，先摘下再释放；合并复用原结点，两个输入链从此由结果持有。',String.raw`int after(Node *p,int x) {
    Node *s=malloc(sizeof *s); if (!s) return 0;
    s->data=x; s->next=p->next; p->next=s; return 1;
}
int remove_after(Node *p,int *out) {
    Node *q=p->next; if (!q) return 0;
    *out=q->data; p->next=q->next; free(q); return 1;
}
void reverse(Node *head) {
    Node *prev=NULL,*cur=head->next;
    while(cur) { Node *next=cur->next; cur->next=prev; prev=cur; cur=next; }
    head->next=prev;
}
Node *merge(Node *a,Node *b) {
    Node dummy={0,NULL},*tail=&dummy;
    while(a && b) {
        if(a->data<=b->data) { tail->next=a; a=a->next; }
        else { tail->next=b; b=b->next; }
        tail=tail->next;
    }
    tail->next=a?a:b; return dummy.next;
}
void clear(Node *p) { while(p) { Node *next=p->next; free(p); p=next; } }`,'    Node h={0,NULL}; int x; assert(after(&h,1)); assert(after(&h,2)); reverse(&h); assert(h.next->data==1); assert(remove_after(&h,&x)&&x==1); clear(h.next); Node a={1,NULL},b={2,NULL}; assert(merge(&a,&b)==&a && a.next==&b);','头插 1 再头插 2 得 2→1；反转后 1→2；删除首数据结点后剩 2。','typedef struct Node { int data; struct Node *next; } Node;\n'),
lesson('doubly','双向循环链表去重（2022 A 卷）','head 为哨兵，数据按非降序排列；相同值仅保留一个。','O(n) 时间，O(1) 辅助空间。','遇重复删后继，修复两条链接并释放；p 留在原处处理连续重复。',String.raw`int unique(DNode *head) {
    int removed=0; DNode *p=head->next;
    while(p!=head && p->next!=head) {
        DNode *q=p->next;
        if(p->data==q->data) {
            p->next=q->next; q->next->prev=p;
            free(q); removed++;
        } else p=p->next;
    }
    return removed;
}
int append(DNode *head,int x) {
    DNode *s=malloc(sizeof *s); if(!s) return 0;
    s->data=x; s->prev=head->prev; s->next=head;
    head->prev->next=s; head->prev=s; return 1;
}`,'    DNode h={0,NULL,NULL}; h.next=h.prev=&h; assert(unique(&h)==0); assert(append(&h,5)); assert(append(&h,5)); assert(append(&h,5)); assert(unique(&h)==2); assert(h.next==h.prev && h.prev->next==&h); free(h.next);','5→5→5：第一次删除后仍比较原 p 和新后继；共删 2 个。','typedef struct DNode { int data; struct DNode *prev,*next; } DNode;\n'),
lesson('polynomial','升幂多项式相加','输入每个指数仅出现一次、系数非零；生成新链表，不改变输入。','O(m+n) 时间，结果占 O(m+n) 空间。','指数较小项直接输出，等指数求和并推进两侧。申请失败清理已生成结果；整数系数运算要求结果在 int 范围内。',String.raw`void destroy(Term *p) { while(p) { Term *q=p->next; free(p); p=q; } }
int add(const Term *a,const Term *b,Term **out) {
    Term dummy={0,0,NULL},*tail=&dummy; *out=NULL;
    while(a || b) {
        int c,e;
        if(!b || (a && a->exp<b->exp)) { c=a->coef; e=a->exp; a=a->next; }
        else if(!a || b->exp<a->exp) { c=b->coef; e=b->exp; b=b->next; }
        else { c=a->coef+b->coef; e=a->exp; a=a->next; b=b->next; }
        if(c) {
            Term *s=malloc(sizeof *s);
            if(!s) { destroy(dummy.next); return 0; }
            *s=(Term){c,e,NULL}; tail->next=s; tail=s;
        }
    }
    *out=dummy.next; return 1;
}`,'    Term a={3,2,NULL},b={-3,2,NULL},*out; assert(add(&a,&b,&out)&&out==NULL); assert(add(&a,NULL,&out)&&out->coef==3); destroy(out);','3x² 与 −3x² 抵消，结果链为空；空表与 3x² 相加仍为 3x²。','typedef struct Term { int coef,exp; struct Term *next; } Term;\n')],
'03': [
lesson('stack-queue','顺序栈与循环队列','栈 top 为个数；队列 front 指队头、rear 指队尾，count 区分空满，全部槽位可用。','单次操作 O(1)，结构空间 O(CAP)。','先判空满再改数据；所有队列下标用模运算回绕。',String.raw`int push(Stack *s,int x) { if(s->top==CAP)return 0; s->a[s->top++]=x; return 1; }
int pop(Stack *s,int *x) { if(!s->top)return 0; *x=s->a[--s->top]; return 1; }
int enqueue(Queue *q,int x) {
    if(q->count==CAP)return 0;
    q->rear=(q->rear+1)%CAP; q->a[q->rear]=x; q->count++; return 1;
}
int dequeue(Queue *q,int *x) {
    if(q->count==0)return 0;
    *x=q->a[q->front]; q->front=(q->front+1)%CAP; q->count--; return 1;
}`,'    Stack s={0}; Queue q={.rear=CAP-1}; int x; assert(!pop(&s,&x)); assert(push(&s,7)&&pop(&s,&x)&&x==7); for(int i=0;i<CAP;i++)assert(enqueue(&q,i)); assert(!enqueue(&q,9)); assert(dequeue(&q,&x)&&x==0); assert(enqueue(&q,9));','CAP=4，入 0,1,2,3 后满；出 0 再入 9，rear 回绕到 0。','enum {CAP=4};\ntypedef struct {int a[CAP],top;} Stack;\ntypedef struct {int a[CAP],front,rear,count;} Queue;\n'),
lesson('linked-queue','链栈与带哨兵链队列','链栈 top 可为 NULL；链队列需先初始化哨兵。','每次入出 O(1)，总空间 O(n)。','删除链队列末项时 rear 必须指回哨兵；返回的值需在 free 之前读取。',String.raw`int push(Node **top,int x) {
    Node *p=malloc(sizeof *p); if(!p)return 0;
    *p=(Node){x,*top}; *top=p; return 1;
}
int pop(Node **top,int *x) {
    Node *p=*top; if(!p)return 0;
    *x=p->data; *top=p->next; free(p); return 1;
}
int init(Q *q) { q->front=q->rear=malloc(sizeof(Node)); if(!q->front)return 0; q->front->next=NULL; return 1; }
int enq(Q *q,int x) {
    Node *p=malloc(sizeof *p); if(!p)return 0;
    *p=(Node){x,NULL}; q->rear->next=p; q->rear=p; return 1;
}
int deq(Q *q,int *x) {
    Node *p=q->front->next; if(!p)return 0;
    *x=p->data; q->front->next=p->next;
    if(q->rear==p)q->rear=q->front;
    free(p); return 1;
}`,'    Q q; Node *s=NULL; int x; assert(init(&q)); assert(enq(&q,4)&&deq(&q,&x)&&x==4); assert(q.front==q.rear); free(q.front); assert(push(&s,3)&&pop(&s,&x)&&x==3);','队列从空到单项再到空，rear 必须恢复到 front。','typedef struct Node {int data; struct Node *next;} Node;\ntypedef struct {Node *front,*rear;} Q;\n'),
lesson('expression','双栈中缀表达式求值','支持非负整数、二元 +−*/ 和括号；有符号 64 位整数运算。','O(n) 时间、O(n) 空间（本示例最多 100 个栈项）。','用 expect 标记当前期待数字/左括号还是操作符/右括号；归约先弹右再弹左。检测除零和运算溢出。',String.raw`int prec(char c) { return c=='+'||c=='-'?1:c=='*'||c=='/'?2:0; }
int reduce(long long v[],int *nv,char o[],int *no) {
    if(*nv<2 || !*no)return 0;
    long long b=v[--*nv],a=v[--*nv],c=0; char op=o[--*no];
    if(op=='+') { if((b>0&&a>LLONG_MAX-b)||(b<0&&a<LLONG_MIN-b))return 0; c=a+b; }
    else if(op=='-') { if((b<0&&a>LLONG_MAX+b)||(b>0&&a<LLONG_MIN+b))return 0; c=a-b; }
    else if(op=='*') {
        if(a>0 ? (b>0 ? a>LLONG_MAX/b : b<LLONG_MIN/a) :
           a<0 ? (b>0 ? a<LLONG_MIN/b : b<0 && a<LLONG_MAX/b) : 0)return 0;
        c=a*b;
    } else if(op=='/') { if(!b||(a==LLONG_MIN&&b==-1))return 0; c=a/b; }
    else return 0;
    v[(*nv)++]=c; return 1;
}
int evaluate(const char *s,long long *out) {
    long long v[100]; char o[100]; int nv=0,no=0,expect=1;
    for(int i=0;s[i];) {
        char c=s[i]; if(c==' '||c=='\t'){i++;continue;}
        if(c>='0'&&c<='9') {
            if(!expect||nv==100)return 0; long long x=0;
            do {int d=s[i++]-'0'; if(x>(LLONG_MAX-d)/10)return 0; x=x*10+d;}while(s[i]>='0'&&s[i]<='9');
            v[nv++]=x; expect=0; continue;
        }
        if(c=='(') {if(!expect||no==100)return 0;o[no++]=c;}
        else if(c==')') {
            if(expect)return 0;
            while(no&&o[no-1]!='(')if(!reduce(v,&nv,o,&no))return 0;
            if(!no)return 0; --no;
        } else if(prec(c)) {
            if(expect)return 0;
            while(no&&o[no-1]!='('&&prec(o[no-1])>=prec(c))if(!reduce(v,&nv,o,&no))return 0;
            if(no==100)return 0; o[no++]=c; expect=1;
        } else return 0;
        i++;
    }
    if(expect)return 0;
    while(no)if(!reduce(v,&nv,o,&no))return 0;
    if(nv!=1)return 0; *out=v[0]; return 1;
}`,'    long long x; assert(evaluate("8-(3-2)*2",&x)&&x==6); assert(!evaluate("1/0",&x)); assert(!evaluate("1 2",&x)); assert(!evaluate("(1",&x));','8−(3−2)×2：先括号得 1，再乘得 2，最后 8−2=6。'),
lesson('pascal','队列式杨辉三角','使用两个有界行缓冲模拟旧行出队、新行入队；r 从 0 开始。','生成 n 行 Θ(n²)，辅助空间 O(n)。','固定旧行长度 k，左右越界当 0，输出后再将新行作为下一轮旧行；最多 30 行保证 long long 安全。',String.raw`void pascal(int n) {
    long long q[31]={1},next[31]; int len=1;
    if(n<0||n>30)return;
    for(int r=0;r<n;r++) {
        for(int j=0;j<len;j++)printf("%lld ",q[j]); puts("");
        long long prev=0;
        for(int j=0;j<=len;j++) {
            long long cur=j<len?q[j]:0;
            next[j]=prev+cur; prev=cur;
        }
        len++; memcpy(q,next,(size_t)len*sizeof *q);
    }
}`,'    pascal(5);','前五行为 1；1 1；1 2 1；1 3 3 1；1 4 6 4 1。')],
'04': [lesson('kmp','BF、next 构造与 KMP','0 基字节串，next[0]=−1；返回首匹配位置，未命中 −1，空模式 0。','BF 最坏 O(nm) / O(1)；KMP O(n+m) / O(m)。','next[j] 只考虑 j 前面的子串；KMP 失配只回退 j。外部传入 next 的容量至少 m；本实现长度使用 int，要求串长≤INT_MAX。',String.raw`int bf(const char *s,const char *p) {
    int n=(int)strlen(s),m=(int)strlen(p),i=0,j=0;
    while(i<n && j<m) {
        if(s[i]==p[j]) {i++;j++;}
        else {i=i-j+1;j=0;}
    }
    return j==m?i-m:-1;
}
void build_next(const char *p,int m,int next[]) {
    if(!m)return; next[0]=-1;
    for(int j=1;j<m;j++) {
        int k=next[j-1];
        while(k!=-1 && p[j-1]!=p[k])k=next[k];
        next[j]=k+1;
    }
}
int kmp(const char *s,const char *p,int next[]) {
    int n=(int)strlen(s),m=(int)strlen(p),i=0,j=0;
    if(!m)return 0; build_next(p,m,next);
    while(i<n && j<m) {
        if(j==-1 || s[i]==p[j]) {i++;j++;}
        else j=next[j];
    }
    return j==m?i-m:-1;
}`,'    int next[100]; assert(kmp("aaaaab","aaab",next)==2); assert(bf("aaaaab","aaab")==2); assert(kmp("","",next)==0); assert(kmp("a","ab",next)==-1);','aaab 的 next 为 −1,0,1,2；在主串 aaaaab 中最终匹配起点为 2。')],
'07': [
lesson('graph','矩阵 DFS、BFS 与拓扑排序','顶点 0..n−1，edge 表示有边；图最多 32 点，按编号升序扫描。','矩阵版均 O(V²) 时间，visited、队列、递归栈 O(V)。邻接表版可达 O(V+E)。','BFS 入队时标记，外层循环遍历非连通图；拓扑用独立入度数组，输出不足 n 则有环。',String.raw`void dfs(int u) {
    seen[u]=1; printf("%d ",u);
    for(int v=0;v<n;v++)if(edge[u][v]&&!seen[v])dfs(v);
}
void dfs_all(void) { memset(seen,0,sizeof seen);for(int u=0;u<n;u++)if(!seen[u])dfs(u); }
void bfs_all(void) {
    memset(seen,0,sizeof seen); int q[32];
    for(int s=0;s<n;s++)if(!seen[s]) {
        int f=0,r=0; q[r++]=s; seen[s]=1;
        while(f<r) {
            int u=q[f++]; printf("%d ",u);
            for(int v=0;v<n;v++)if(edge[u][v]&&!seen[v]) {seen[v]=1;q[r++]=v;}
        }
    }
}
int topological(int order[]) {
    int indeg[32]={0},q[32],f=0,r=0,k=0;
    for(int u=0;u<n;u++)for(int v=0;v<n;v++)indeg[v]+=edge[u][v]!=0;
    for(int v=0;v<n;v++)if(!indeg[v])q[r++]=v;
    while(f<r) {
        int u=q[f++]; order[k++]=u;
        for(int v=0;v<n;v++)if(edge[u][v]&&--indeg[v]==0)q[r++]=v;
    }
    return k==n;
}`,'    int order[32]; n=4; edge[0][1]=edge[0][2]=edge[1][3]=1; dfs_all(); bfs_all(); assert(topological(order)); edge[3][0]=1; assert(!topological(order));','0→1,0→2,1→3：DFS 0,1,3,2；BFS 0,1,2,3。添加 3→0 后拓扑失败。','static int n,edge[32][32],seen[32];\n'),
lesson('dijkstra','Dijkstra 与 Prim','矩阵用 INF 表示无边，0 为合法权；n≤32，边权绝对值≤10⁶。','矩阵版 O(V²) 时间，额外数组 O(V)。','Dijkstra 用路径和更新且拒绝负边；Prim 只用单边权更新，非连通返回失败。INF=LLONG_MAX/4，有限距离有明确范围，避免溢出。',String.raw`int dijkstra(int n,int s,long long w[32][32],long long d[],int prev[]) {
    int used[32]={0}; if(n<1||n>32||s<0||s>=n)return 0;
    for(int i=0;i<n;i++)for(int j=0;j<n;j++)if(w[i][j]<0)return 0;
    for(int v=0;v<n;v++){d[v]=INF;prev[v]=-1;} d[s]=0;
    for(int k=0;k<n;k++) {
        int u=-1;
        for(int v=0;v<n;v++)if(!used[v]&&(u==-1||d[v]<d[u]))u=v;
        if(u==-1||d[u]==INF)break; used[u]=1;
        for(int v=0;v<n;v++)if(!used[v]&&w[u][v]!=INF&&d[u]+w[u][v]<d[v]) {
            d[v]=d[u]+w[u][v]; prev[v]=u;
        }
    } return 1;
}
int prim(int n,long long w[32][32],long long *total,int parent[]) {
    long long low[32]; int used[32]={0}; if(n<1||n>32)return 0;
    for(int v=0;v<n;v++){low[v]=INF;parent[v]=-1;} low[0]=0; *total=0;
    for(int k=0;k<n;k++) {
        int u=-1;
        for(int v=0;v<n;v++)if(!used[v]&&(u==-1||low[v]<low[u]))u=v;
        if(u==-1||low[u]==INF)return 0;
        used[u]=1; *total+=low[u];
        for(int v=0;v<n;v++)if(!used[v]&&w[u][v]<low[v]){low[v]=w[u][v];parent[v]=u;}
    } return 1;
}`,'    long long w[32][32],d[32],total; int p[32]; for(int i=0;i<32;i++)for(int j=0;j<32;j++)w[i][j]=INF; w[0][1]=w[1][0]=3; w[0][2]=w[2][0]=4; w[1][2]=w[2][1]=2; assert(dijkstra(3,0,w,d,p)&&d[2]==4); assert(prim(3,w,&total,p)&&total==5); assert(!prim(4,w,&total,p));','三角形权 3,4,2，最短路 A→C=4；MST 总权 5；增加孤立点后 Prim 无法给出生成树。','static const long long INF=LLONG_MAX/4;\n'),
lesson('kruskal','Kruskal 与并查集','无向边仅列一次；n≤100，m≤1000；返回选中边数并累计森林权重。','排序 O(E log E)，并查集采用压缩路径和按秩合并。','按权排序，端点同集合拒绝；成功选择数为 n−1 才有整图 MST。',String.raw`int root(int p[],int x) { return p[x]==x?x:(p[x]=root(p,p[x])); }
int cmp(const void *a,const void *b) { const Edge *x=a,*y=b; return (x->w>y->w)-(x->w<y->w); }
int kruskal(int n,Edge e[],int m,long long *weight) {
    int p[100],rank[100]={0},used=0; *weight=0;
    for(int i=0;i<n;i++)p[i]=i;
    qsort(e,(size_t)m,sizeof *e,cmp);
    for(int i=0;i<m;i++) {
        int a=root(p,e[i].u),b=root(p,e[i].v); if(a==b)continue;
        if(rank[a]<rank[b]){int t=a;a=b;b=t;}
        p[b]=a;if(rank[a]==rank[b])rank[a]++;
        *weight+=e[i].w;used++;
    } return used;
}`,'    Edge e[]={{0,1,3},{0,2,4},{1,2,2}}; long long w; assert(kruskal(3,e,3,&w)==2&&w==5);','先选 1−2:2，再选 0−1:3，0−2:4 成环拒绝。','typedef struct {int u,v,w;} Edge;\n')],
'08': [
lesson('binary','顺序、二分与分块查找','二分表递增，返回首个命中；分块索引最大值递增且块间范围有序。','顺序 O(n)；二分 O(log n)；分块顺序索引 O(b+s)；迭代空间 O(1)。','闭区间用 mid±1 收缩；命中继续左搜。分块先定位首个 max≥x 的块。',String.raw`int sequential(const int a[],int n,int x) {for(int i=0;i<n;i++)if(a[i]==x)return i;return -1;}
int binary(const int a[],int n,int x) {
    int lo=0,hi=n-1,ans=-1;
    while(lo<=hi) {
        int mid=lo+(hi-lo)/2;
        if(a[mid]<x)lo=mid+1;
        else {if(a[mid]==x)ans=mid;hi=mid-1;}
    } return ans;
}
int block_search(const int a[],const int maxima[],const int start[],int b,int n,int x) {
    int k=0;while(k<b&&maxima[k]<x)k++;
    if(k==b)return -1;int end=k+1<b?start[k+1]:n;
    for(int i=start[k];i<end;i++)if(a[i]==x)return i;
    return -1;
}`,'    int a[]={1,2,2,2,4},mx[]={2,4},st[]={0,3}; assert(binary(a,5,2)==1); assert(binary(a,0,2)==-1); assert(binary(a,5,3)==-1); assert(block_search(a,mx,st,2,5,4)==4);','首个 2 在下标 1；找 3 最终 lo>hi，返回 −1。'),
lesson('bst','BST 查找、插入与删除','互异键；插入遇重复保持原树。根用 Node** 更新，申请失败返回 0。','单次 O(h+1)，递归栈 O(h+1)，退化时均可 O(n)。','双孩子删除用右子树最小值替换，再到右子树删除该值。',String.raw`Node *find(Node *p,int x) { while(p&&p->key!=x)p=x<p->key?p->left:p->right; return p; }
int insert(Node **p,int x) {
    if(!*p) { *p=malloc(sizeof **p); if(!*p)return 0; **p=(Node){x,NULL,NULL}; return 1; }
    if(x==(*p)->key)return 1;
    return insert(x<(*p)->key?&(*p)->left:&(*p)->right,x);
}
void erase(Node **p,int x) {
    if(!*p)return;
    if(x<(*p)->key)erase(&(*p)->left,x);
    else if(x>(*p)->key)erase(&(*p)->right,x);
    else {
        Node *q=*p;
        if(!q->left||!q->right) { *p=q->left?q->left:q->right;free(q); }
        else {Node *s=q->right;while(s->left)s=s->left;q->key=s->key;erase(&q->right,s->key);}
    }
}
void clear(Node *p) { if(p){clear(p->left);clear(p->right);free(p);} }`,'    Node *r=NULL; assert(insert(&r,2)&&insert(&r,1)&&insert(&r,3)); erase(&r,2); assert(r->key==3&&find(r,1)); erase(&r,1); erase(&r,3); assert(!r); clear(r);','删根 2，用后继 3 替代，再删除右侧旧 3；继续删除后树变空。','typedef struct Node {int key;struct Node *left,*right;} Node;\n'),
lesson('array-bst','数组 BST 全局判定（2022 A 卷）','数组按完全树槽位编号，0 表示空位，非空结点为正整数；len 是槽位数。','O(len) 时间；树递归深度 O(log len)，扫描空位后代保证没有孤儿。','给每个子树传递严格上下界，禁止重复；先检查每个非空结点的双亲非空，再递归。不通过正负值推断结点个数。',String.raw`int valid_subtree(const int a[],size_t len,size_t i,long long lo,long long hi) {
    if(i>=len||a[i]==0)return 1;
    if(a[i]<=lo||a[i]>=hi)return 0;
    /* i<len，且 len 为可实际分配的 int 数组长度，2*i+2 不溢出 size_t。 */
    return valid_subtree(a,len,2*i+1,lo,a[i])&&valid_subtree(a,len,2*i+2,a[i],hi);
}
int valid_bst(const int a[],size_t len) {
    for(size_t i=0;i<len;i++) {
        if(a[i]<0)return 0;
        if(i&&a[i]&&a[(i-1)/2]==0)return 0;
    }
    return valid_subtree(a,len,0,LLONG_MIN,LLONG_MAX);
}`,'    int good[]={10,5,15,0,7},bad[]={10,5,15,0,12},orphan[]={0,3}; assert(valid_bst(good,5)); assert(!valid_bst(bad,5)); assert(!valid_bst(orphan,2)); assert(valid_bst(NULL,0));','10 的左子树中出现 12，即使它大于直接父亲 5，也违反上界 10。'),
lesson('hash','线性探测的查找、插入和删除','状态 EMPTY/USED/DELETED 独立保存，允许 0 和负键。','单次最坏 O(m)，低装填和均匀散列预期 O(1)，结构空间 O(m)。','最多探测 M 次；插入记首个墓碑但继续查重；查找越过墓碑，遇真正空槽失败。',String.raw`int hash(int x) {int r=x%P;return r<0?r+P:r;}
int find(const Table *t,int x) {
    int h=hash(x);
    for(int i=0;i<M;i++) {int j=(h+i)%M;
        if(t->state[j]==EMPTY)return -1;
        if(t->state[j]==USED&&t->key[j]==x)return j;
    } return -1;
}
int insert(Table *t,int x) {
    int first=-1,h=hash(x);
    for(int i=0;i<M;i++) {int j=(h+i)%M;
        if(t->state[j]==USED&&t->key[j]==x)return 1;
        if(t->state[j]==DELETED&&first<0)first=j;
        if(t->state[j]==EMPTY) {if(first<0)first=j;break;}
    }
    if(first<0)return 0;t->key[first]=x;t->state[first]=USED;return 1;
}
int erase(Table *t,int x) {int j=find(t,x);if(j<0)return 0;t->state[j]=DELETED;return 1;}`,'    Table t={0}; assert(insert(&t,1)&&insert(&t,6)); assert(erase(&t,1)); assert(find(&t,6)==2); assert(insert(&t,-4)); assert(find(&t,-4)==1);','M=P=5，1 与 6 冲突；删 1 后槽 1 成墓碑，查 6 仍能到槽 2。','enum {M=5,P=5};\nenum {EMPTY=0,USED,DELETED};\ntypedef struct {int key[M],state[M];} Table;\n')],
'09': [
lesson('basic-sorts','插入、二分插入、希尔、冒泡与选择','升序原地排序，n≥0；对空数组不访问元素。','插入/冒泡最好 O(n)，通常最坏 O(n²)；选择恒 Θ(n²)；希尔依增量；均 O(1) 辅助空间。','直接插入只搬移大于 key 的项；二分找 upper_bound；冒泡无交换提前停；选择记录 min 后仅交换一次。',String.raw`void swap(int *a,int *b){int t=*a;*a=*b;*b=t;}
void insertion(int a[],int n) {
    for(int i=1;i<n;i++){int x=a[i],j=i;while(j>0&&a[j-1]>x){a[j]=a[j-1];j--;}a[j]=x;}
}
void binary_insertion(int a[],int n) {
    for(int i=1;i<n;i++) {int x=a[i],lo=0,hi=i;
        while(lo<hi){int m=lo+(hi-lo)/2;if(a[m]<=x)lo=m+1;else hi=m;}
        for(int j=i;j>lo;j--)a[j]=a[j-1];a[lo]=x;
    }
}
void shell(int a[],int n) {
    for(int gap=n/2;gap>0;gap/=2)for(int i=gap;i<n;i++) {
        int x=a[i],j=i;while(j>=gap&&a[j-gap]>x){a[j]=a[j-gap];j-=gap;}a[j]=x;
    }
}
void bubble(int a[],int n) {
    for(int end=n-1;end>0;end--){int changed=0;for(int j=0;j<end;j++)if(a[j]>a[j+1]){swap(&a[j],&a[j+1]);changed=1;}if(!changed)break;}
}
void selection(int a[],int n) {
    for(int i=0;i+1<n;i++){int k=i;for(int j=i+1;j<n;j++)if(a[j]<a[k])k=j;if(k!=i)swap(&a[i],&a[k]);}
}`,'    void (*f[])(int*,int)={insertion,binary_insertion,shell,bubble,selection}; for(int k=0;k<5;k++){int a[]={3,-1,3,2};f[k](a,4);assert(a[0]==-1&&a[1]==2&&a[3]==3);f[k](a,0);}','[3,−1,3,2] 均得到 [−1,2,3,3]。用身份标签才能额外判断稳定性。'),
lesson('quick','课件双向快速排序','首项基准交换到右端，左右扫描并在交换后推进，支持重复值。','平均 O(n log n)，最坏 O(n²)；栈平均 O(log n)，最坏 O(n)。','扫描都设边界；两指针相遇时仍交换并前进，避免相等键停滞。划分后排除基准递归。',String.raw`void swap(int *a,int *b){int t=*a;*a=*b;*b=t;}
int partition(int a[],int l,int r) {
    swap(&a[l],&a[r]);int pivot=a[r],i=l,j=r-1;
    while(i<=j) {
        while(i<=j&&a[i]<pivot)i++;
        while(i<=j&&a[j]>pivot)j--;
        if(i<=j){swap(&a[i],&a[j]);i++;j--;}
    }
    swap(&a[i],&a[r]);return i;
}
void quick(int a[],int l,int r) {
    if(l>=r)return;int p=partition(a,l,r);
    quick(a,l,p-1);quick(a,p+1,r);
}`,'    int a[]={2,2,-1,4,2};quick(a,0,4);for(int i=1;i<5;i++)assert(a[i-1]<=a[i]);quick(a,0,-1);','同键比较停下后也交换并推进，所有键相等时不会死循环。'),
lesson('heap-merge','堆排序与稳定二路归并','堆有效长度独立传入；归并使用一个 n 项缓冲区。','堆 O(n log n)/O(1)；归并 O(n log n)/O(n)。','堆选较大孩子，根交换到尾后缩小边界；归并相等取左段，末段不足宽度仍要复制。',String.raw`void swap(int *a,int *b){int t=*a;*a=*b;*b=t;}
void down(int a[],int n,int p) {
    while(2*p+1<n){int c=2*p+1;if(c+1<n&&a[c+1]>a[c])c++;if(a[p]>=a[c])break;swap(&a[p],&a[c]);p=c;}
}
void heap_sort(int a[],int n) {
    for(int i=n/2-1;i>=0;i--)down(a,n,i);
    for(int end=n-1;end>0;end--){swap(&a[0],&a[end]);down(a,end,0);}
}
void merge_range(int a[],int tmp[],int l,int m,int r) {
    int i=l,j=m,k=l;
    while(i<m&&j<r)tmp[k++]=a[i]<=a[j]?a[i++]:a[j++];
    while(i<m)tmp[k++]=a[i++];while(j<r)tmp[k++]=a[j++];
    for(i=l;i<r;i++)a[i]=tmp[i];
}
void merge_rec(int a[],int tmp[],int l,int r) {
    if(r-l<2)return;int m=l+(r-l)/2;
    merge_rec(a,tmp,l,m);merge_rec(a,tmp,m,r);merge_range(a,tmp,l,m,r);
}
int merge_sort(int a[],int n) {
    if(n<2)return 1;int *tmp=malloc((size_t)n*sizeof *tmp);if(!tmp)return 0;
    merge_rec(a,tmp,0,n);free(tmp);return 1;
}`,'    int a[]={3,1,2,1},b[]={3,1,2,1};heap_sort(a,4);assert(merge_sort(b,4));for(int i=0;i<4;i++)assert(a[i]==b[i]);assert(a[0]==1&&a[3]==3);','堆区不断收缩，有序尾段不参与下滤；归并先将 [3,1]、[2,1] 各自排序再合并。'),
lesson('distribution','稳定计数与 LSD 基数排序','非负整数 0..999，n≤100；每一位都稳定回填。','计数 O(n+k)/O(n+k)；LSD O(d(n+10))/O(n+10)。','先验证输入再修改；计数前缀表示结束位置，倒序回填并前减位置，防止同键次序翻转。',String.raw`int counting(int a[],int n,int maxkey) {
    int count[1000]={0},out[100];if(n<0||n>100||maxkey<0||maxkey>999)return 0;
    for(int i=0;i<n;i++){if(a[i]<0||a[i]>maxkey)return 0;count[a[i]]++;}
    for(int v=1;v<=maxkey;v++)count[v]+=count[v-1];
    for(int i=n-1;i>=0;i--)out[--count[a[i]]]=a[i];
    memcpy(a,out,(size_t)n*sizeof *a);return 1;
}
int radix(int a[],int n) {
    int out[100],max=0;if(n<0||n>100)return 0;
    for(int i=0;i<n;i++){if(a[i]<0||a[i]>999)return 0;if(a[i]>max)max=a[i];}
    for(int exp=1;exp<=max;exp*=10) {
        int count[10]={0};for(int i=0;i<n;i++)count[a[i]/exp%10]++;
        for(int d=1;d<10;d++)count[d]+=count[d-1];
        for(int i=n-1;i>=0;i--)out[--count[a[i]/exp%10]]=a[i];
        memcpy(a,out,(size_t)n*sizeof *a);
    } return 1;
}`,'    int a[]={21,12,11,0},b[]={21,12,11,0};assert(counting(a,4,21));assert(radix(b,4));for(int i=0;i<4;i++)assert(a[i]==b[i]);assert(b[0]==0&&b[3]==21);','个位分发后 0,21,11,12；十位后 0,11,12,21。')]
};
