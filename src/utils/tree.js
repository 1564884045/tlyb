/* 树形结构的常用方法 */

/**
 * Array转树形结构的算法
 * @param {Array} list             代转化数组
 * @param {String|Number} parentId 起始节点（默认为'0'）
 * @param {String} pAttr           父节点key值。默认pid
 * @param {String} attr            当前节点唯一标志。默认id
 * @param {String} leafAttr        表示叶子节点属性。为空时，不添加叶子属性
 */
export function getTrees(list, parentId = '0', pAttr = 'pid', attr = 'id', leafAttr) {
  let items = {}
  // 获取每个节点的直属子节点，*记住是直属，不是所有子节点
  for (let i = 0; i < list.length; i++) {
    let key = list[i][pAttr]
    if (items[key]) {
      items[key].push(list[i])
    } else {
      items[key] = []
      items[key].push(list[i])
    }
  }
  return formatTree(items, parentId, attr, leafAttr)
}

// 利用递归格式化每个节点
function formatTree(items, parentId, attr, leafAttr) {
  let result = []
  if (!items[parentId]) {
    return result
  }
  for (let t of items[parentId]) {
    const temp = formatTree(items, t[attr], attr)
    if (temp.length > 0) {
      t.children = temp
    } else if (leafAttr) {
      t[leafAttr] = true
    }
    result.push(t)
  }
  return result
}

/**
 * 根据节点值查找树形结构中的路径
 * @param {String|Number} value 节点的值
 * @param {Array} tree 树形结构
 * @param {String} attr 匹配值的属性
 * @param {String} childAttr 匹配子节点数组的属性
 */
export function findTreePath(value, tree, attr = 'id', childAttr = 'children') {
  if (!(tree instanceof Array)) {
    console.error('tree: 请传入树形数组进行过滤！')
    return []
  }
  if (tree.length === 0) return

  for (let i = 0; i < tree.length; i++) {
    const item = tree[i]

    if (item[attr] === value) {
      // 如果找到， 则跳出
      return [item[attr]]
    }
    if (item[childAttr]) {
      const path = findTreePath(value, item[childAttr], attr, childAttr)
      if (path.length > 0) {
        // 子节点找到, 把本节点插入到第一个
        path.splice(0, 0, item[attr])
        return path
      }
    }
  }
  return []
}

/**
 * 查找树的指定节点
 * @param {String|Number} value 节点的值
 * @param {Array} tree 树形结构
 * @param {String} attr 匹配值的属性
 * @param {String} childAttr 匹配子节点数组的属性
 */
export function findTreeNode(value, tree, attr = 'id', childAttr = 'children') {
  if (!(tree instanceof Array)) {
    console.error('tree: 请传入树形数组进行过滤！')
    return null
  }
  if (tree.length === 0) return

  for (let i = 0; i < tree.length; i++) {
    const item = tree[i]

    if (item[attr] === value) {
      // 如果找到， 则跳出
      return item
    }
    if (item[childAttr]) {
      const node = findTreeNode(value, item[childAttr], attr, childAttr)
      if (node) {
        // 找到即返回
        return node
      }
    }
  }

  return null
}

/**
 * 生成当前树节点的排序值
 * @param {Array} list {pid, id, sort}
 * @param {String} pid 父节点ID
 */
export function generateSort(list, pid) {
  if (pid === 0 || pid === '0') {
    // 根节点处理
    return getMax(list)
  }

  let result = 0
  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    if (item.id === pid) {
      if (item.children && item.children.length > 0) {
        result = getMax(item.children)
        break
      }
      break
    } else if (item.children) {
      const res = generateSort(item.children, pid)
      if (res > 0) result = res // 通过res来判断是否在当前分支
    }
  }
  return result
}
// 计算几个节点中最大的排序值
function getMax(list) {
  let result = 0
  list.forEach(a => {
    if (a.sort && a.sort > result) {
      result = a.sort
    }
  })
  // 在最大的基础上加一
  return result + 1
}

/**
 * 树 转 列表
 * 广度优先，先进先出
 * @param {Array} tree 树状数据
 * @param {String} childKey children的key
 */
export function treeToList(tree, childKey = 'children') {
  let stack = tree.concat([])
  let data = []
  while (stack.length !== 0) {
    // 从stack中拿出来分析
    let shift = stack.shift() // stack.pop()  先进后出
    data.push(shift)
    let children = shift[childKey]
    if (children) {
      for (let i = 0; i < children.length; i++) {
        // 把数据放入stack中
        stack.push(children[i])
      }
    }
  }
  return data
}