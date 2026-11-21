const helpers = String.raw`#include <assert.h>
#include <stdbool.h>
#include <stdio.h>

static void swap(int *x, int *y)
{
    int saved = *x;
    *x = *y;
    *y = saved;
}`;

const siftUp = String.raw`static void sift_up(int heap[], int i)
{
    while (i > 0) {
        int parent = (i - 1) / 2;
        if (heap[parent] >= heap[i]) break;
        swap(&heap[parent], &heap[i]);
        i = parent;
    }
}`;

const siftDown = String.raw`static void sift_down(int heap[], int n, int i)
{
    while (i < n / 2) {  /* i 有左孩子 */
        int child = 2 * i + 1;
        int right = child + 1;
        if (right < n && heap[right] > heap[child]) {
            child = right;
        }
        if (heap[i] >= heap[child]) break;
        swap(&heap[i], &heap[child]);
        i = child;
    }
}`;

const push = String.raw`bool heap_push(int heap[], int *n, int capacity, int value)
{
    if (*n >= capacity) return false;
    int i = *n;
    heap[i] = value;
    ++(*n);
    sift_up(heap, i);
    return true;
}`;

const pop = String.raw`bool heap_pop_max(int heap[], int *n, int *out)
{
    if (*n == 0) return false;
    *out = heap[0];
    --(*n);
    if (*n > 0) {
        heap[0] = heap[*n];
        sift_down(heap, *n, 0);
    }
    return true;
}`;

const build = String.raw`void build_max_heap(int heap[], int n)
{
    for (int i = n / 2; i > 0; --i) {
        sift_down(heap, n, i - 1);
    }
}`;

const driver = String.raw`int main(void)
{
    int heap[7] = {4, 10, 3, 5, 1, 8};
    int n = 6;
    int maximum;

    build_max_heap(heap, n);
    if (!heap_push(heap, &n, 7, 12)) return 1;
    if (!heap_pop_max(heap, &n, &maximum)) return 1;
    assert(maximum == 12);

    for (int i = 1; i < n; ++i) {
        assert(heap[(i - 1) / 2] >= heap[i]);
    }
    printf("max = %d\n", maximum);
    for (int i = 0; i < n; ++i) {
        printf("%d%s", heap[i], i + 1 == n ? "\n" : " ");
    }
    return 0;
}`;

export const heapCode = {
    title: '维护最大堆',
    description: '手写上滤、下滤、插入、删除堆顶和自底向上建堆。',
    declarations: helpers,
    steps: [
        {
            title: '上滤（sift_up）',
            reasoning: '从新结点向根检查。当前值大于父结点时交换，再从父结点位置向上检查。',
            trace: '将 12 放到 [10, 5, 8, 4, 1, 3] 的末尾后，先和 8 交换，再和 10 交换。',
            code: siftUp,
        },
        {
            title: '下滤（sift_down）',
            reasoning: '先从存在的孩子中选较大者，再与当前位置比较。当前值较小时交换，沿交换后的分支继续。',
            trace: '[3, 5, 8, 4, 1] 从根下滤，需要选 8，因此得到 [8, 5, 3, 4, 1]。',
            code: siftDown,
        },
        {
            title: '插入（heap_push）',
            reasoning: '确认还有容量，将新值写到下标 n，把有效元素数加一，然后从新位置上滤。满堆返回 false。',
            trace: '插入 12 后得到 [12, 5, 10, 4, 1, 3, 8]。',
            code: push,
        },
        {
            title: '删除堆顶（heap_pop_max）',
            reasoning: '先保存堆顶，再缩小有效范围。剩余元素非空时，用旧末元素补根，再从根下滤。空堆返回 false。',
            trace: '对 [10, 5, 8, 4, 1, 3] 删除堆顶，取出 10，先用 3 补根，再和 8 交换。',
            code: pop,
        },
        {
            title: '自底向上建堆（build_max_heap）',
            reasoning: '从最后一个非叶结点 n / 2 − 1 向前，对每个结点做下滤。处理一个父结点时，它的孩子子树已经是堆。',
            trace: '对 [4, 10, 3, 5, 1, 8] 依次检查下标 2、1、0，得到 [10, 5, 8, 4, 1, 3]。',
            code: build,
        },
    ],
    driver,
};
