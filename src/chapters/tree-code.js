const declarations = String.raw`#include <stddef.h>
#include <stdio.h>

enum { CAP = 100 };

typedef struct Node {
    char data;
    const struct Node *left;
    const struct Node *right;
} Node;

static void visit(const Node *p)
{
    printf("%c ", p->data);
}`;

const inorder = String.raw`int inorder(const Node *root)
{
    const Node *stack[CAP];
    int top = 0;
    const Node *p = root;

    while (p != NULL || top > 0) {
        while (p != NULL) {
            if (top == CAP) return 0;
            stack[top++] = p;
            p = p->left;
        }
        p = stack[--top];
        visit(p);
        p = p->right;
    }
    return 1;
}`;

const preorder = String.raw`int preorder(const Node *root)
{
    const Node *stack[CAP];
    int top = 0;
    const Node *p = root;

    while (p != NULL || top > 0) {
        while (p != NULL) {
            if (top == CAP) return 0;
            visit(p);
            stack[top++] = p;
            p = p->left;
        }
        p = stack[--top]->right;
    }
    return 1;
}`;

const postorder = String.raw`int postorder(const Node *root)
{
    const Node *stack[CAP];
    int top = 0;
    const Node *p = root;
    const Node *last = NULL;

    while (p != NULL || top > 0) {
        while (p != NULL) {
            if (top == CAP) return 0;
            stack[top++] = p;
            p = p->left;
        }
        const Node *parent = stack[top - 1];
        if (parent->right != NULL && parent->right != last) {
            p = parent->right;
        } else {
            visit(parent);
            last = stack[--top];
        }
    }
    return 1;
}`;

const levelorder = String.raw`int levelorder(const Node *root)
{
    const Node *queue[CAP];
    int front = 0, rear = 0, count = 0;
    if (root == NULL) return 1;
    queue[rear++] = root;
    count++;

    while (count > 0) {
        const Node *p = queue[front];
        front = (front + 1) % CAP;
        count--;
        visit(p);
        const Node *children[] = {p->left, p->right};
        for (int i = 0; i < 2; i++) {
            if (children[i] == NULL) continue;
            if (count == CAP) return 0;
            queue[rear] = children[i];
            rear = (rear + 1) % CAP;
            count++;
        }
    }
    return 1;
}`;

const driver = String.raw`int main(void)
{
    const Node d = {'D', NULL, NULL};
    const Node e = {'E', NULL, NULL};
    const Node f = {'F', NULL, NULL};
    const Node b = {'B', &d, &e};
    const Node c = {'C', NULL, &f};
    const Node a = {'A', &b, &c};

    if (!inorder(&a)) return 1;
    putchar('\n');  /* D B E A C F */
    if (!preorder(&a)) return 1;
    putchar('\n');  /* A B D E C F */
    if (!postorder(&a)) return 1;
    putchar('\n');  /* D E B F C A */
    if (!levelorder(&a)) return 1;
    putchar('\n');  /* A B C D E F */
    return 0;
}`;

export const treeCode = {
    title: '二叉树的非递归遍历',
    description: '用二叉链表手写前序、中序、后序和层序遍历。先掌握中序，再对照另外三种的访问时机。',
    declarations,
    steps: [
        {
            title: '中序（左、根、右）',
            reasoning: '沿左链压栈。走到空指针时弹出栈顶，访问该结点，再转入其右子树。外层循环在当前指针为空且栈也为空时结束。',
            trace: '压入 A、B、D；弹出并访问 D，随后弹出并访问 B，再进入 E。完整序列为 D B E A C F。',
            code: inorder,
        },
        {
            title: '前序（根、左、右）',
            reasoning: '遇到非空结点就访问，再压栈并沿左链下降。弹栈只用于找下一棵右子树。',
            trace: '沿左链先输出 A、B、D，回到 B 后才转入 E。完整序列为 A B D E C F。',
            code: preorder,
        },
        {
            title: '后序（左、右、根）',
            reasoning: '沿左链压栈之后只查看栈顶。若有尚未完成的右子树，先转入右子树。右子树为空或其根刚被输出时，才能访问并弹出当前栈顶。',
            trace: '在 B 处，D 刚访问完时还要进入 E。E 输出后，last 等于 B 的右孩子，下一次才输出 B。完整序列为 D E B F C A。',
            code: postorder,
        },
        {
            title: '层序（从上到下、从左到右）',
            reasoning: '根先入队，每轮出队一个结点并访问，再依次把非空左孩子和右孩子入队。循环队列用 count 区分空队和满队。',
            trace: 'A 出队后，B、C 依次入队。处理 B 时，D、E 排在 C 后面。完整序列为 A B C D E F。',
            code: levelorder,
        },
    ],
    driver,
};
