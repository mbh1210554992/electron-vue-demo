import go from 'gojs'
import dataModel from './diagramModel.js'
const $make = go.GraphObject.make
let myDiagram = null
const $query = document.querySelector.bind(document)

const diagramModel = {
  modelData: {// 流程图model
    'class': 'GraphLinksModel',
    'linkFromPortIdProperty': 'fromPort',
    'linkToPortIdProperty': 'toPort',
    'modelData': {'position': '0 0'},
    'nodeDataArray': [],
    'linkDataArray': []
  },
  nodeData: {'text': 's', 'category': 'start', 'key': 0}, // 节点model
  linkData: {'from': 1, 'to': -1, 'fromPort': 'B', 'toPort': 'T'}, // 链接model
  category: {1: 'open', 2: 'click', 3: 'input', 4: 'circulation', 5: 'extract', 6: 'conditional', 7: 'conditionalIf', 8: 'mouseover', 9: 'codeExtract'}// 操作节点类型集合
}

/**
 * 流程图处理模块
 * @param that //vue页面实例
 * @constructor
 */
function Diagram (that) {
  let self = this

  self.thatObj = that
  self.taskData = []
}

/**
 * 初始化流程图
 */
Diagram.prototype.initDiagram = function () {
  let self = this
  let thatObj = self.thatObj// vue页面实例

  myDiagram =
        $make(go.Diagram, 'myDiagramDiv',
          {
            // what to do when a drag-drop occurs in the Diagram's background
            /* mouseDrop: function(e) { finishDrop(e, null); }, */
            mouseDrop: function (e) { showAdd(false) },
            mouseDragOver: function (e) { showAdd(true) },
            layout: // Diagram has simple horizontal layout
            /* $(go.GridLayout,
                  { wrappingWidth: Infinity, alignment: go.GridLayout.Position, cellSize: new go.Size(1, 1) }), */
            // 垂直布局
                    $make(go.LayeredDigraphLayout,
                      { direction: 90, layerSpacing: 8, isRealtime: false }),
            'commandHandler.archetypeGroupData': { isGroup: true, category: 'OfNodes' },
            'undoManager.isEnabled': false, // 是否开启撤销/恢复功能
            allowZoom: false, // 允许缩放，false为否
            allowMove: false, // 允许移动
            allowDragOut: true, // 允许拖动
            contentAlignment: go.Spot.Center, // 画布位置
            allowHorizontalScroll: true, // 禁止水平拖动画布
            allowVerticalScroll: true, // 禁止垂直拖动画布
            'grid.visible': false// 显示网格
          })

  // 拖动对象到组中时，高亮显示
  function highlightGroup (e, grp, show) {
    if (!grp) return
    grp.isHighlighted = show

    showAdd(show)
  }

  // 拖动对象到组中时，添加该对象
  function finishDrop (e, grp) {
    /* var ok = (grp !== null
            ? grp.addMembers(grp.diagram.selection, true)
            : e.diagram.commandHandler.addTopLevelParts(e.diagram.selection, true));
        if (!ok) e.diagram.currentTool.doCancel(); */
    e.diagram.selection.all(function (node) {
      if (!node) return
      let data = node.data
      self.dragTaskData(grp.data, data)
    })
  }

  /** ******************************注册事件**********************************/
  window.PIXELRATIO = myDiagram.computePixelRatio() // 获取鼠标位置

  // 注册添加点击事件，显示右侧详情
  myDiagram.addDiagramListener('ObjectSingleClicked', function (e) {
    if (e.subject.part.data.key == undefined) { // 链接
      const link = e.subject.part.data
      // console.log(JSON.stringify(link));
    } else { // 节点
      const node = e.subject.part.data
      // console.log(JSON.stringify(node));

      if (node.key == 0 || node.key == -1) {
        return
      }

      const query = queryNodeData(node.key, self.taskData)
      thatObj.opeEle = query
      // console.log("点击的节点信息："+JSON.stringify(query));
      thatObj.$emit('modifyDiagram', {type: 1, data: query})// 通知父页面
    }
  })

  // 注册监听键盘按下事件
  myDiagram.commandHandler.doKeyDown = function () {
    var e = myDiagram.lastInput
    var control = e.control || e.meta
    var key = e.key
    // 取消Ctrl+Z/Y，Backspace删除键的命令关联:
    // if (control && (key === 'Z' || key === 'C' || key === 'V')) return;
    if (key === 'Backspace' || control) return

    go.CommandHandler.prototype.doKeyDown.call(this)
  }

  // 重新注册删除事件，开始结束节点不能删除
  myDiagram.commandHandler.canDeleteSelection = function (e) {
    // 用例获取选中的节点或线
    return myDiagram.selection.all(function (nodeOrLink) {
      console.log(nodeOrLink.data)
      let node = nodeOrLink.data
      // 开始、结束和条件判断的分支节点不允许删除
      if (node.category == 'start' || node.category == 'end') {
        return false
      } else if (node.nodeType == 7) {
        // 条件分支，2支时禁止删除
        let size = queryChildNodeSize(node.key, self.taskData)
        if (size == 2) return false
      }
      return true
    })
    return false
  }

  // 监听节点或线的删除前事件,自动更新流程图
  myDiagram.addDiagramListener('SelectionDeleting', function (e) {
    e.subject.each(function (n) {
      // n为删除节点或线的对象
      let node = n.data
      let flag = deleteNodeData(node.key, self.taskData)
      if (flag) {
        setTimeout(() => {
          // 异步更新流程图
          self.updateDiagram({taskData: self.taskData})
        }, 200)
      }
      thatObj.$emit('modifyDiagram', {type: 3})// 通知父页面
      thatObj.opeEle = self.taskData[0]// 修改选中节点
    })
  })

  /** *****************************设置拖动生成节点*********************************/
  let dragType = null// 拖动添加节点类型
  document.addEventListener('dragstart', function (event) {
    showAdd(true)// 显示增加节点图标
    if (event.target.className.indexOf('draggable') < 0) return
    dragType = event.target.id
  }, false)

  document.addEventListener('dragend', function (event) {
    showAdd(false)// 隐藏增加节点图标
  }, false)

  let diagramDiv = document.getElementById('myDiagramDiv')
  let dragoverNode = null
  let dragoverLink = null
  diagramDiv.addEventListener('dragover', function (event) {
    if (this === myDiagram.div) {
      let curnode = dropLinkOrNode(event)

      if (dragoverLink) {
        linkhighlightAdd(null, dragoverLink, false)
        dragoverLink = null
      }
      if (dragoverNode) {
        dragoverNode.isHighlighted = false
        dragoverNode = null
      }

      if (curnode instanceof go.Node) {
        dragoverNode = curnode
        // 高亮 TODO
        dragoverNode.isHighlighted = true
      } else if (curnode instanceof go.Link) {
        dragoverLink = curnode
        linkhighlightAdd(null, curnode, true)
      }
    }
    event.preventDefault()
  }, false)

  // 监听拖动事件
  diagramDiv.addEventListener('drop', function (event) {
    event.preventDefault()
    // Dragging onto a Diagram
    if (this === myDiagram.div) {
      let curnode = dropLinkOrNode(event)

      if (curnode) {
        if (curnode instanceof go.Node) {
          dragoverNode = null
          curnode.isHighlighted = false
        } else if (curnode instanceof go.Link) {
          dragoverLink = null
          linkhighlightAdd(null, curnode, false)
        }

        let linkOrNode = curnode.data
        self.dragNodeData(linkOrNode, dragType, dragoverNode)
      }
    }
  }, false)

  function dropLinkOrNode (event) {
    let can = event.target
    let pixelratio = window.PIXELRATIO
    // if the target is not the canvas, we may have trouble, so just quit:
    if (!(can instanceof HTMLCanvasElement)) return
    let bbox = can.getBoundingClientRect()
    let bbw = bbox.width
    if (bbw === 0) bbw = 0.001
    let bbh = bbox.height
    if (bbh === 0) bbh = 0.001
    let mx = event.clientX - bbox.left * ((can.width / pixelratio) / bbw)// - dragged.offsetX;
    let my = event.clientY - bbox.top * ((can.height / pixelratio) / bbh)// - dragged.offsetY;
    let point = myDiagram.transformViewToDoc(new go.Point(mx, my))
    let curnode = myDiagram.findPartAt(point, true)
    return curnode
  }

  /** **********************增加右键菜单删除功能***********************************/
  var cxElement = document.getElementById('contextMenu')
  var myContextMenu = $make(go.HTMLInfo, {
    show: showContextMenu,
    mainElement: cxElement
  })
  cxElement.addEventListener('contextmenu', function (e) {
    e.preventDefault()
    return false
  }, false)
  function showContextMenu (obj, diagram, tool) {
    // Show only the relevant buttons given the current state.
    var cmd = diagram.commandHandler
    cxElement.style.display = 'block'
    // we don't bother overriding positionContextMenu, we just do it here:
    var mousePt = diagram.lastInput.viewPoint
    cxElement.style.left = mousePt.x + 'px'
    cxElement.style.top = mousePt.y + 'px'
  }

  /** **********************创建模板对象功能***********************************/
  // 创建判断组件方法
  function makeIfGroupTemplate () {
    return $make(go.Group, 'Auto',
      {
        background: 'transparent',
        // highlight when dragging into the Group
        mouseDragEnter: function (e, grp, prev) { highlightGroup(e, grp, true) },
        mouseDragLeave: function (e, grp, next) { highlightGroup(e, grp, false) },
        computesBoundsAfterDrag: true,
        mouseDrop: finishDrop,
        handlesDragDropForMembers: true, // don't need to define handlers on member Nodes and Links
        // Groups containing Groups lay out their members horizontally
        layout:
                    $make(go.GridLayout,
                      {
                        wrappingWidth: Infinity,
                        alignment: go.GridLayout.Position,
                        cellSize: new go.Size(1, 1),
                        spacing: new go.Size(4, 4)
                      })
      },
      new go.Binding('background', 'isHighlighted', function (h) { return h ? 'rgba(255,0,0,0.2)' : 'transparent' }).ofObject(),
      $make(go.Shape, 'Rectangle',
        { fill: null, stroke: '#FFDD33', strokeWidth: 2 }),
      $make(go.Panel, 'Vertical', // title above Placeholder
        $make(go.Panel, 'Horizontal', // button next to TextBlock
          { stretch: go.GraphObject.Horizontal, background: '#FFDD33' },
          $make('SubGraphExpanderButton',
            { alignment: go.Spot.Right, margin: 5 }),
          $make(go.TextBlock,
            {
              alignment: go.Spot.Left,
              editable: false,
              margin: 5,
              font: 'bold 18px sans-serif',
              opacity: 0.75,
              stroke: '#404040'
            },
            new go.Binding('text', 'text').makeTwoWay())
        ), // end Horizontal Panel
        $make(go.Placeholder,
          { padding: 5, alignment: go.Spot.TopLeft })
      ) // end Vertical Panel
    )
  }

  // 创建判断分支组件
  function makeConditionIfGroupTemplate () {
    return $make(go.Group, 'Auto',
      {
        contextMenu: myContextMenu,
        background: 'transparent',
        ungroupable: true,
        // highlight when dragging into the Group
        mouseDragEnter: function (e, grp, prev) { highlightGroup(e, grp, true) },
        mouseDragLeave: function (e, grp, next) { highlightGroup(e, grp, false) },
        mouseEnter: function (e, node) { showSmallPorts(node, true) },
        mouseLeave: function (e, node) { showSmallPorts(node, false) },
        computesBoundsAfterDrag: true,
        mouseDrop: finishDrop,
        handlesDragDropForMembers: true, // don't need to define handlers on member Nodes and Links
        // Groups containing Nodes lay out their members vertically
        layout:
                    $make(go.LayeredDigraphLayout,
                      { direction: 90, layerSpacing: 4 })
      },
      new go.Binding('background', 'isHighlighted', function (h) { return h ? 'rgba(255,0,0,0.5)' : 'transparent' }).ofObject(),
      $make(go.Shape, 'Rectangle',
        { fill: null, stroke: '#33D3E5', strokeWidth: 2, background: 'rgba(255,255,255,0.8)'}),
      $make(go.Panel, 'Vertical', // title above Placeholder
        $make(go.Panel, 'Horizontal', // button next to TextBlock
          { stretch: go.GraphObject.Horizontal, background: '#33d3e5', opacity: 0.75 },
          $make('SubGraphExpanderButton',
            { alignment: go.Spot.Left, margin: 5 }),
          $make(go.TextBlock,
            {
              alignment: go.Spot.Center,
              editable: false,
              margin: 5,
              font: 'bold 14px sans-serif',
              opacity: 0.75,
              stroke: 'rgb(0,0,0)'
            },
            new go.Binding('text', 'text').makeTwoWay())
        ),
        $make(go.Placeholder,
          { padding: 20, alignment: go.Spot.TopLeft})
      ), // end Vertical Panel
      makeConditionIfPort('L', go.Spot.Left),
      makeConditionIfPort('R', go.Spot.Right)
    )
  };
  // 显示连接点
  function showSmallPorts (node, show) {
    node.ports.each(function (port) {
      if (port.portId !== '') { // don't change the default port, which is the big shape
        port.visible = show
      }
    })
  }
  function makeConditionIfPort (name, spot) {
    return $make(go.Panel, 'Auto',
      {
        name: 'addIfNode',
        click: addIfNode,
        visible: false,
        alignment: spot, // align the port on the main Shape
        alignmentFocus: spot, // just inside the Shape
        portId: name, // declare this object to be a "port"
        cursor: 'pointer'
      },

      $make(go.Shape, 'Circle', // for search
        { width: 15,
          height: 15,
          fill: '#0D5CFF',
          strokeWidth: 2,
          stroke: null}),
      $make(go.Shape, 'PlusLine',
        { width: 10,
          height: 10,
          strokeWidth: 2,
          stroke: '#fff'})
    )
  };
  function addIfNode (e, obj) {
    let data = obj.part.data
    let port = obj.portId
    self.addConditionIfPort(data, port)
  }
  // 创建循环组件方法
  function makeCircleGroupTemplate () {
    return $make(go.Group, 'Auto',
      {
        contextMenu: myContextMenu,
        background: 'transparent',
        ungroupable: true,
        // highlight when dragging into the Group
        mouseDragEnter: function (e, grp, prev) { highlightGroup(e, grp, true) },
        mouseDragLeave: function (e, grp, next) { highlightGroup(e, grp, false) },
        computesBoundsAfterDrag: true,
        mouseDrop: finishDrop,
        handlesDragDropForMembers: true, // don't need to define handlers on member Nodes and Links
        // Groups containing Nodes lay out their members vertically
        layout:
                    $make(go.LayeredDigraphLayout,
                      { direction: 90, layerSpacing: 4 })
      },
      new go.Binding('background', 'isHighlighted', function (h) { return h ? 'rgba(255,0,0,0.5)' : 'transparent' }).ofObject(),
      $make(go.Shape, 'Rectangle',
        { fill: null, stroke: '#33D3E5', strokeWidth: 2, background: 'rgba(255,255,255,0.8)'}),
      $make(go.Panel, 'Vertical', // title above Placeholder
        $make(go.Panel, 'Horizontal', // button next to TextBlock
          { stretch: go.GraphObject.Horizontal, background: '#33d3e5', opacity: 0.75 },
          $make('SubGraphExpanderButton',
            { alignment: go.Spot.Left, margin: 5 }),
          $make(go.TextBlock,
            {
              alignment: go.Spot.Right,
              editable: false,
              margin: 5,
              font: 'bold 14px sans-serif',
              opacity: 0.75,
              stroke: 'rgb(0,0,0)'
            },
            new go.Binding('text', 'text').makeTwoWay())
        ),
        $make(go.Placeholder,
          { padding: 20, alignment: go.Spot.TopLeft })
      ) // end Vertical Panel
    )
  }

  // 添加循环组件
  myDiagram.groupTemplateMap.add('circulation', makeCircleGroupTemplate())
  // 添加判断组件
  myDiagram.groupTemplateMap.add('conditional', makeCircleGroupTemplate())
  // 添加判断分支组件
  myDiagram.groupTemplateMap.add('conditionalIf', makeConditionIfGroupTemplate())

  // 创建自定义开始结束模板方法
  function makeStartNodeTemplate (icon) {
    return $make(go.Node, 'Spot',
      { locationSpot: go.Spot.Center },
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
      new go.Binding('angle').makeTwoWay(),
      $make(go.Panel, 'Auto',
        { name: 'PANEL'},
        new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(go.Size.stringify),
        $make(go.Shape, 'Circle', // default figure
          {
            portId: '', // the default port: if no spot on link data, use closest side
            fromLinkable: false,
            toLinkable: false,
            cursor: 'pointer',
            desiredSize: new go.Size(20, 20),
            fill: 'white', // default color
            strokeWidth: 1,
            stroke: '#289de9'
          },
          new go.Binding('figure'),
          new go.Binding('fill')),
        $make(go.Picture, __static + icon,
          {
            name: 'Picture',
            desiredSize: new go.Size(25, 25)
            /* margin: new go.Margin(1, 1, 1, 1), */
          }
        )
      )
    )
  };
  // 创建自定义图形
  function makeCustomNodeTemplate (icon) {
    return $make(go.Node, 'Spot',
      { locationSpot: go.Spot.Center, contextMenu: myContextMenu},
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
      $make(go.Shape,
        {// 自定义图形
          width: 100,
          height: 30,
          margin: 1,
          cursor: 'pointer',
          fill: 'rgba(255,255,255,0.8)',
          strokeWidth: 1.2, // 边框宽度
          stroke: '#1b95e9', // 边框颜色
          opacity: 1
          // angle: 20,//角度
        }
      ),
      $make(go.Panel, 'Horizontal',
        $make(go.Picture, __static + icon,
          {
            name: 'Picture',
            desiredSize: new go.Size(20, 20)
          }
        ),
        // define the panel where the text will appear
        $make(go.Panel, 'Table',
          {
            maxSize: new go.Size(100, 100),
            margin: new go.Margin(0, 2, 0, 2),
            defaultAlignment: go.Spot.Left
          },
          $make(go.TextBlock, // the name
            {
              row: 0,
              column: 0,
              columnSpan: 1,
              font: '12px Helvetica, Arial, sans-serif',
              editable: false,
              isMultiline: false,
              maxSize: new go.Size(80, 40)
            },
            new go.Binding('text').makeTwoWay())
        )
      )
      // four small named ports, one on each side:
      /* makePort("T", go.Spot.Top, true, true),
            makePort("L", go.Spot.Left, true, true),
            makePort("R", go.Spot.Right, true, true),
            makePort("B", go.Spot.Bottom, true, true) */
    )
  };

  // 自定义图形开始节点
  myDiagram.nodeTemplateMap.add('start', makeStartNodeTemplate('/img/svg/kiashi.svg'))
  // 自定义图形结束节点
  myDiagram.nodeTemplateMap.add('end', makeStartNodeTemplate('/img/svg/zanting.svg'))
  // 自定义图形-打开网页
  myDiagram.nodeTemplateMap.add('open', makeCustomNodeTemplate('/img/svg/wangy.svg'))
  // 自定义图形-点击元素
  myDiagram.nodeTemplateMap.add('click', makeCustomNodeTemplate('/img/svg/dianj.svg'))
  // 自定义图形-输入文本
  myDiagram.nodeTemplateMap.add('input', makeCustomNodeTemplate('/img/svg/shur.svg'))
  // 自定义图形-提取元素
  myDiagram.nodeTemplateMap.add('extract', makeCustomNodeTemplate('/img/svg/tiqu.svg'))
  // 自定义图形-鼠标悬浮分支
  myDiagram.nodeTemplateMap.add('mouseover', makeCustomNodeTemplate('/img/svg/shub.svg'))
  // 自定义图形-验证码
  myDiagram.nodeTemplateMap.add('codeExtract', makeCustomNodeTemplate('/img/svg/yanzm.svg'))

  /** *******************************************连线*************************************************/
  var linkSelectionAdornmentTemplate =
        $make(go.Adornment, 'Link',
          $make(go.Shape,
            { isPanelMain: true, fill: null, stroke: 'deepskyblue', strokeWidth: 0 }) // use selection object's strokeWidth
        )

  // 高亮拖动增加节点图标
  function linkhighlightAdd (e, grp, show) {
    // console.log("mouseDrag:"+show);
    if (!grp) return
    let tb = grp.findObject('addBlock')
    // if (tb !== null) tb.visible = show;
    if (tb !== null) tb.fill = show ? '#0D5CFF' : 'rgba(126,123,121,0.63)'
  }

  // 增加拖动节点
  function linefinishDrop (e, grp) {
    e.diagram.selection.all(function (node) {
      if (!node) return
      let data = node.data
      self.dragTaskData(grp.data, data)
    })
    showAdd(false)
  }

  let isShow = false
  // 隐藏、显示拖动增加图标
  function showAdd (show) {
    if (show == isShow) return
    isShow = show

    let it = myDiagram.links
    while (it.next()) {
      let link = it.value
      let pan = link.findObject('addPanel')
      if (pan !== null) pan.visible = show
    }
  }

  // 定义连线
  myDiagram.linkTemplate =
        $make(go.Link, // the whole link panel
          { selectable: true, selectionAdornmentTemplate: linkSelectionAdornmentTemplate},
          // { relinkableFrom: false, relinkableTo: false, reshapable: true },
          {
            routing: go.Link.AvoidsNodes,
            curve: go.Link.JumpGap,
            corner: 5,
            toShortLength: 4,
            mouseDragEnter: function (e, grp, prev) { linkhighlightAdd(e, grp, true) },
            mouseDragLeave: function (e, grp, next) { linkhighlightAdd(e, grp, false) },
            mouseDrop: linefinishDrop
          },
          // new go.Binding("points").makeTwoWay(),
          // new go.Binding("fromEndSegmentLength"),
          // new go.Binding("toEndSegmentLength"),
          $make(go.Shape, // the link path shape
            { isPanelMain: true, strokeWidth: 1, margin: 10}),
          $make(go.Shape, // the arrowhead
            { toArrow: 'Standard', stroke: null }),
          $make(go.Panel, 'Auto', {name: 'addPanel'},
            {visible: false},
            $make(go.Shape, 'Circle', { name: 'addBlock' }, // for search
              { width: 15,
                height: 15,
                margin: 10,
                fill: 'rgba(126,123,121,0.63)',
                strokeWidth: 2,
                stroke: null}),
            $make(go.Shape, 'PlusLine',
              { width: 10,
                height: 10,
                strokeWidth: 2,
                stroke: '#fff'})
          )
        )

  // load();
}

function load () {
  let mode = {
    'class': 'GraphLinksModel',
    'nodeDataArray': [
      {'text': '开始', 'key': 1, 'category': 'start'},
      {'key': 2, 'text': '循环列表', 'isGroup': true, 'category': 'circulation'},
      {'text': '点击元素', 'key': 3, 'group': 2, 'category': 'click'},
      {'text': '提取数据', 'key': 4, 'group': 2, 'category': 'extract'},
      {'text': '结束', 'key': 5, 'category': 'end'},
      {'key': -6, 'text': '循环列表', 'isGroup': true, 'category': 'circulation', 'group': 2},
      {'text': '提取数据', 'key': -8, 'group': -6, 'category': 'extract'}
    ],
    'linkDataArray': [
      {'from': '1', 'to': '2'},
      {'from': '3', 'to': '4'},
      {'from': '4', 'to': '-6'},
      {'from': '2', 'to': '5'}
    ]}
  myDiagram.model = go.Model.fromJson(mode)
}

/**
 * 更新流程图
 * @param data
 */
Diagram.prototype.updateDiagram = function (data) {
  let self = this

  let taskData = data.taskData
  self.taskData = taskData

  let model = deepCopy(diagramModel.modelData)// 创建模型
  let start = addStartNode(model)

  // 递归遍历Json数据生成node节点
  let curNode = self.createDiagramModel(model, start, taskData)

  addEndNode(curNode, model)
  // 更新流程图model
  // console.log(JSON.stringify(model));
  myDiagram.model = go.Model.fromJson(model)
}

/**
 * 递归遍历生成node节点
 * @param model 流程图模型数据
 * @param curNode 最新操纵的模型节点
 * @param taskData 采集流程json数据
 * @returns {Array}
 */
Diagram.prototype.createDiagramModel = function (model, curNode, taskData) {
  let self = this

  let preNode = curNode// 开始节点
  for (let i in taskData) {
    const data = taskData[i]
    if (data.type == 1 || data.type == 2 || data.type == 3 ||
            data.type == 5 || data.type == 8 || data.type == 9) { // 1打开网页,2点击元素，3输入文本，5采集字段,8悬浮，9验证码
      let node = createNodes(preNode, data)
      model.nodeDataArray.push(node)// 新节点插入到nodeDataArray

      // 添加节点链接[组内第一个元素不加连线]
      if (preNode.key != curNode.key || !preNode.isGroup) {
        let link = createNodeLink(curNode, node)
        model.linkDataArray.push(link)
      }
      curNode = node// 更新当前操作节点
    } else if (data.type == 4) { // 循环,递归生成node
      // 先生成循环节点数据
      const node = createNodes(preNode, data)
      model.nodeDataArray.push(node)// 新节点插入到nodeDataArray

      // 添加节点链接
      if (preNode.key != curNode.key || !preNode.isGroup) {
        const link = createNodeLink(curNode, node)
        model.linkDataArray.push(link)
      }

      // 递归生成循环中节点
      let childNode = self.createDiagramModel(model, node, data.childOperate)
      childNode.parentKey = node.key

      curNode = node
    } else if (data.type == 6) { // 条件判断
      // 生成判断节点数据
      const node = createNodes(preNode, data)
      model.nodeDataArray.push(node)

      // 添加节点链接
      if (preNode.key != curNode.key || !preNode.isGroup) {
        const link = createNodeLink(curNode, node)
        model.linkDataArray.push(link)
      }

      let childNode = self.createDiagramModel(model, node, data.childOperate)
      curNode = node
    } else if (data.type == 7) { // 条件分支
      // 生成分支节点数据
      const node = createNodes(preNode, data)
      model.nodeDataArray.push(node)

      let childNode = self.createDiagramModel(model, node, data.childOperate)
      curNode = node
    }
  }

  return curNode
}

/** *********************************右键菜单功能***************************************/
Diagram.prototype.cxcommand = function (event, val) {
  let self = this

  if (val === undefined) val = event.currentTarget.id
  var diagram = myDiagram
  let selectNode = null
  diagram.selection.all(function (node) {
    selectNode = node.data
  })
  switch (val) {
    case 'delete':
      let canDel = diagram.commandHandler.canDeleteSelection()
      if (canDel) { diagram.commandHandler.deleteSelection() }
      break
    case 'cope':
      // diagram.commandHandler.copySelection();
      self.copyNode = self.copyNodeData(selectNode.key)// 复制节点
      break
    case 'paste':
      // diagram.commandHandler.pasteSelection(diagram.lastInput.documentPoint);
      self.pasteNodeDate(selectNode)// 粘贴节点
      self.copyNode = {}
      break
  }
  diagram.currentTool.stopTool()
}

// 复制节点
Diagram.prototype.copyNodeData = function (key) {
  let self = this

  let node = queryNodeData(key, self.taskData)
  let newNode = JSON.parse(JSON.stringify(node))
  self.reSetNodeId(newNode)
  return newNode
}

Diagram.prototype.reSetNodeId = function (node) {
  let self = this
  let thatObj = self.thatObj

  if (thatObj.utils.isEmpty(node)) return

  node.id = thatObj.utils.createRandomId()
  if (node.type == 4 || node.type == 6 || node.type == 7) {
    node.childOperate.forEach((child) => {
      self.reSetNodeId(child)
    })
  }
}
// 粘贴节点
Diagram.prototype.pasteNodeDate = function (node) {
  let self = this
  let thatObj = self.thatObj

  let copeNode = self.copyNode
  if (thatObj.utils.isEmpty(copeNode)) return

  if (copeNode.type == 7 && node.nodeType != 6) return

  let nodeData = queryNodeData(node.key, self.taskData)
  // 循环和条件分支插入到子节点中
  if (nodeData.type == 4 || nodeData.type == 7) {
    addCycleNodeData(nodeData.id, copeNode, self.taskData)
  } else if (nodeData.type == 6 && copeNode.type == 7) {
    addCycleNodeData(nodeData.id, copeNode, self.taskData)
  } else {
    addNodeData(nodeData.id, copeNode, self.taskData)
  }

  setTimeout(() => {
    // 更新流程图
    self.updateDiagram({taskData: self.taskData})
  }, 200)
}

/** *******************************拖动流程图节点功能***********************************/
// 拖动流程图节点
Diagram.prototype.dragTaskData = function (linkOrNode, dropNode) {
  let self = this

  // 开始、结束、判断分支不允许拖动
  if (dropNode.category == 'start' || dropNode.category == 'end' || dropNode.category == 'conditionalIf') return

  // 判断是连线or组对象
  let isLink = linkOrNode.from != null
  let key = isLink ? linkOrNode.from : linkOrNode.key
  let dropKey = dropNode.key

  if (isLink) {
    // 拖动位置不变
    if (linkOrNode.from == dropNode.key || linkOrNode.to == dropNode.key) return

    let nodeData = queryNodeData(dropKey, self.taskData)
    let newData = JSON.parse(JSON.stringify(nodeData))// 复制节点
    // 删除移动的节点
    deleteNodeData(dropKey, self.taskData)

    if (linkOrNode.from == 0) { // 开始节点
      self.taskData.splice(0, 0, newData)
    } else {
      addNodeData(key, newData, self.taskData)
    }
  } else {
    // 判断组件只能是条件分支组件
    if (linkOrNode.category == 'conditional' || isChildNode(key, dropKey, self.taskData)) return
    let nodeData = queryNodeData(dropKey, self.taskData)
    let newData = JSON.parse(JSON.stringify(nodeData))// 复制节点
    // 删除移动的节点
    deleteNodeData(dropKey, self.taskData)

    addCycleNodeData(key, newData, self.taskData)
  }

  // 更新流程图
  setTimeout(() => {
    self.updateDiagram({taskData: self.taskData})
  }, 200)
}
/** ****************************点击新增条件分支********************************/
Diagram.prototype.addConditionIfPort = function (ifNode, port) {
  let self = this
  let thatObj = self.thatObj
  if (ifNode == null) return

  let node = deepCopy(dataModel.conditional.childOperate[0])// 创建判断条件
  node.id = thatObj.utils.createRandomId()

  addConditionIfNodeData(ifNode.key, node, self.taskData, port)

  // 更新流程图
  setTimeout(() => {
    self.updateDiagram({taskData: self.taskData})
  }, 200)
}
/** ***************************拖动新增组件********************************/
/**
 * 拖拽元素添加到流程图中
 * @param link 添加新元素的link
 * @param dragType 添加元素的类型
 * @param dragoverNode 鼠标下方的元素
 **/
Diagram.prototype.dragNodeData = function (linkOrNode, dragType, dragoverNode) {
  let self = this
  let thatObj = self.thatObj

  if (linkOrNode == null) return

  // 判断是连线or组对象
  let isLink = linkOrNode.from != null
  let key = isLink ? linkOrNode.from : linkOrNode.key

  // 判断组件内不能是其他节点
  if (!isLink && linkOrNode.category == 'conditional') return

  let newNode = null
  if (dragType == 1) {
    newNode = deepCopy(dataModel.openUrl)// 创建打开网页
  } else if (dragType == 2) {
    newNode = deepCopy(dataModel.clickEle)// 创建点击元素
  } else if (dragType == 3) {
    newNode = deepCopy(dataModel.inputText)// 创建输入文本
  } else if (dragType == 4) {
    newNode = deepCopy(dataModel.circulate)// 创建循环
  } else if (dragType == 5) {
    newNode = deepCopy(dataModel.extract)// 创建提取元素
    newNode.fieldList = []
  } else if (dragType == 6) {
    newNode = deepCopy(dataModel.conditional)// 创建判断条件
    newNode.childOperate.forEach(node => {
      node.id = thatObj.utils.createRandomId()
    })
  } else if (dragType == 8) {
    newNode = deepCopy(dataModel.clickEle)// 创建鼠标悬浮
    newNode.name = '悬浮'
    newNode.type = 8
  } else if (dragType == 9) {
    newNode = deepCopy(dataModel.codeExtract)// 创建验证码识别
  }
  newNode.id = thatObj.utils.createRandomId()

  // 适用于createDiagramPlus方法修改
  if (isLink) {
    if (linkOrNode.from == 0) { // 开始节点
      self.taskData.splice(0, 0, newNode)
    } else {
      addNodeData(key, newNode, self.taskData)
    }
  } else {
    addCycleNodeData(key, newNode, self.taskData)
  }
  // 更新流程图
  setTimeout(() => {
    self.updateDiagram({taskData: self.taskData})
  }, 200)
}

/**
 * 判断组内的元素是否允许拖动：还是拖动到自己组内不移动
 **/
function isChildNode (groupKey, dropKey, taskData) {
  let group = queryNodeData(groupKey, taskData)
  let childNode = group.childOperate

  for (let i in childNode) {
    let node = childNode[i]
    if (node.id == dropKey) {
      return true
    }
  }

  return false
}

// 查询是否父级节点
function queryParentNodeKey (key, taskData, parentKeys) {
  for (let i in taskData) {
    let node = taskData[i]
    if (key == node.id) {
      return true
    }
    if (node.type == 4 || node.type == 6 || node.type == 7) {
      let is = queryParentNodeKey(key, node.childOperate, parentKeys)
      if (is) {
        parentKeys.push(node.id)
        return true
      }
    }
  }
  return false
}

// 将节点添加到拖动的指定位置中
function addNodeData (key, newNode, taskData) {
  for (let i = 0; i < taskData.length; i++) {
    let node = taskData[i]
    if (key == node.id) {
      taskData.splice(i + 1, 0, newNode)
      return true
    }
    // 递归循环、条件判断、条件分支中的元素
    if (node.type == 4 || node.type == 6 || node.type == 7) {
      let is = addNodeData(key, newNode, node.childOperate)
      if (is) return true
    }
  }
  return false
}
// 将节点添加到拖动指定的循环节点中
function addCycleNodeData (key, newNode, taskData, addHead) {
  for (let i in taskData) {
    let node = taskData[i]
    if (key == node.id) {
      if (addHead) {
        node.childOperate.splice(0, 0, newNode)
      } else {
        node.childOperate.push(newNode)
      }
      return true
    }
    if (node.type == 4 || node.type == 6 || node.type == 7) {
      let is = addCycleNodeData(key, newNode, node.childOperate, addHead)
      if (is) return true
    }
  }
  return false
}
// 将条件分支节点添加到拖动的指定位置中
function addConditionIfNodeData (key, newNode, taskData, port) {
  for (let i = 0; i < taskData.length; i++) {
    let node = taskData[i]
    if (key == node.id) {
      if (port == 'L') {
        taskData.splice(i, 0, newNode)
      } else {
        taskData.splice(i + 1, 0, newNode)
      }
      return true
    }
    // 递归循环、条件判断、条件分支中的元素
    if (node.type == 4 || node.type == 6 || node.type == 7) {
      let is = addConditionIfNodeData(key, newNode, node.childOperate, port)
      if (is) return true
    }
  }
  return false
}
/**
 * 查询节点信息
 * @param key 节点的id
 * @param taskData 采集配置数据
 * @returns {*} 返回查询到的节点
 */
function queryNodeData (key, taskData) {
  let node = {}
  for (let d in taskData) {
    const data = taskData[d]
    if (key == data.id) {
      return data
    }
    if (data.type == 4 || data.type == 6 || data.type == 7) {
      node = queryNodeData(key, data.childOperate)
      if (node.id) {
        return node
      }
    }
  }
  return node
}

// 查询子节点数量
function queryChildNodeSize (key, taskData) {
  for (let i in taskData) {
    let node = taskData[i]
    if (key == node.id) {
      return taskData.length
    }
    if (node.type == 4 || node.type == 6 || node.type == 7) {
      let num = queryChildNodeSize(key, node.childOperate)
      if (num > -1) return num
    }
  }
  return -1
}

// 删除指定节点
function deleteNodeData (key, taskData) {
  for (let i in taskData) {
    let node = taskData[i]
    if (key == node.id) {
      taskData.splice(i, 1)
      return true
    }
    if (node.type == 4 || node.type == 6 || node.type == 7) {
      let is = deleteNodeData(key, node.childOperate)
      if (is) return true
    }
  }
  return false
}

/**
 * 添加节点
 * @param preNode
 * @param da
 * @returns {any}
 */
function createNodes (preNode, da) {
  let node = deepCopy(diagramModel.nodeData)
  node.text = da.name// 设置节点名称
  node.key = da.id// 设置节点key
  node.cycleWay = da.cycleWay
  node.category = diagramModel.category[da.type]// 设置节点类型
  node.nodeType = da.type
  if (da.type == 4 || da.type == 6 || da.type == 7) {
    node.isGroup = true
  }
  if (preNode.isGroup) {
    node.group = preNode.key
  }
  return node
}

// 添加开始节点{"text":"s", "category":"start", "key":0};
function addStartNode (model) {
  let node = deepCopy(diagramModel.nodeData)
  node.text = 's'// 设置节点名称
  node.key = 0// 设置节点key
  node.category = 'start'// 设置节点类型
  node.nodeType = 0
  model.nodeDataArray.push(node)
  return node
}

// 添加end节点、连线
function addEndNode (curNode, model) {
  let node = deepCopy(diagramModel.nodeData)
  node.text = 'e'// 设置节点名称
  node.key = -1// 设置节点key
  node.category = 'end'// 设置节点类型
  node.nodeType = '-1'
  model.nodeDataArray.push(node)

  let link = createNodeLink(curNode, node)
  model.linkDataArray.push(link)
}

// 添加链接
function createNodeLink (start, end) {
  // 添加节点链接link:{"from":1, "to":-1, "fromPort":"R", "toPort":"L"}
  let link = deepCopy(diagramModel.linkData)
  link.fromType = start.nodeType
  link.parentKey = start.parentKey
  link.from = start.key// 设置链接开始节点
  link.to = end.key// 设置结束节点
  link.fromPort = 'B'// 节点链接位置
  link.toPort = 'T'// 结束节点链接位置
  return link
}

function deepCopy (data) {
  return JSON.parse(JSON.stringify(data))
}

// export default Diagram
export default Diagram
