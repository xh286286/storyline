d3.storyline = function() {
  var storyline = {},
      personHeight = 24,
      phPer = 0.6,
      phPad = (1-phPer) /2;
      personPadding = 4,
      channelHeight = 10,
      size = [300, 300],
      vSize = [1,1,1],
      people = [],
      topics = [],
      links = [],
      slots = []
      ;

  storyline.size = function(_) {
    if (!arguments.length) return size;
    size = _;
    return storyline;
  };
  
  storyline.personHeight = function(_) {
    if (!arguments.length) return personHeight;
    personHeight = +_;
    return storyline;
  };

  storyline.personPadding = function(_) {
    if (!arguments.length) return personPadding;
    personPadding = +_;
    return storyline;
  };

  storyline.people = function(_) {
    if (!arguments.length) return people;
    people = _;
    return storyline;
  };

  storyline.topics = function(_) {
    if (!arguments.length) return topics;
    topics = _;
    return storyline;
  };

  storyline.visuallinks = function() {
    return links;
  };

  storyline.layout = function() {

    initialColor();
  	initialTopics();
    initialLinks();
    computeTopicPeopleOrder();
    
    scaleComponents();
    return storyline;
  };
  
  storyline.relayout = function() {
  	
   // scaleComponents();
    return storyline;
  };

  
  storyline.link = function() {
    var curvature = .5;

    function link(d) {
      var x0 = d.left.rightx,
          x1 = d.right.leftx,
          xi = d3.interpolateNumber(x0, x1),
          x2 = xi(curvature),
          x3 = xi(1 - curvature),
          y0 = d.left.y + d.left.dy / 2,
          y1 = d.right.y + d.right.dy / 2;
      return "M" + x0 + "," + y0 
           + "C" + x2 + "," + y0
           + " " + x3 + "," + y1
           + " " + x1 + "," + y1;
    }

    link.curvature = function(_) {
      if (!arguments.length) return curvature;
      curvature = +_;
      return link;
    };

    return link;
  };
  function initialColor() {
    color = d3.scale.category20();
    var i;
    for (i = 0; i<people.length; i++) {
      people[i].color = color(i);
    }
  }
  function initialTopics() { 
  	var i,j;
    function comp1(a,b) { return a.begin - b.begin; }
  	topics.sort(comp1);
    vSize[0] = 0; vSize[1] = 100;
    if (topics.length>0) {
      vSize[0] = topics[0].begin;
      vSize[1] = topics[0].end;
    }
  	var m = topics.length;
    var totslots = 0;
  	for ( i = 0; i<m; i++) {
      if (topics[i].begin < vSize[0]) vSize[0] = topics[i].begin;
      if (topics[i].end < vSize[1]) vSize[1] = topics[i].end;
      var temp = topics[i].participants;
      for ( j = 0; j< temp.length; j++) {
        var index = temp[j];
        temp[j] = {};
        temp[j].index = index;
        temp[j].person = people[index];
      }	  	  	
      var s = topics[i].slot;
      if (s+1 > totslots) totslots = s+1;
      if (slots[s] === undefined) {
        slots[s] = {};
        slots[s].height = temp.length;
      }
      else {
        if (temp.length > slots[s].height) slots[s].height = temp.length;
      }
  	}
    var acc = 0;
    for (i=0; i<totslots; i++) {
      if (slots[i] === undefined) slots[i] = {"height":0};
      slots[i].y = acc;
      acc += slots[i].height;
    }
    vSize[2] = acc;
  }

	function initialLinks() {
  	var i, j,
  			n = people.length;
  	var m = topics.length;
  	links = [];
    var lastEnd = people.slice();
    for ( i = 0; i<m; i++) {
      var temp = topics[i].participants;
      for (j = 0; j<temp.length; j++) {
        var p = temp[j].index;
        var newlink = {};
        newlink.left = lastEnd[p];
        lastEnd.right = newlink;
        temp[j].left= newlink;
        newlink.right = temp[j];
        newlink.person = people[p];
        links.push(newlink);
        lastEnd[p] = temp[j];
      }
    }
    for ( i =0; i<n; i++) {
      var newlink = {};
      newlink.left = lastEnd[i];
      lastEnd[i].right = newlink;
      people[i].left= newlink;
      newlink.right = people[i];
      newlink.person = people[i];
      links.push(newlink);
    }
  }
  function computeTopicPeopleOrder() {
    var i, j,
        n = people.length;
    var m = topics.length;
    order = [];
    for (i=0; i<n; i++) {
      order[i] = {};
      order[i].a = 0;
      order[i].b = i;
    }
    function comp2(a,b) {
      var a1,b1;
      a1 = order[a.index];
      b1 = order[b.index];
      if (a1.a !== b1.a) return a1.a - b1.a;
      else return a1.b - b1.b;
    }
    for (i =0 ; i<m; i++) {
      var temp  = topics[i].participants;
      temp.sort(comp2);
      for (j=0; j<temp.length; j++) {
        order[temp[j].index] = {"a":topics[i].slot, "b":j};
      }
    }    
  }
  function scaleComponents() {
    var leftx, rightx;
    var i,j,k;
    var n = people.length;
    var m = topics.length;
    leftx = vSize[0];
    rightx = vSize[1];
    leftx -= (vSize[1] - vSize[0]) * 0.1;
    rightx += (vSize[1] - vSize[0]) * 0.1;
    channelHeight = size[1] / vSize[2];
    var ph = channelHeight * phPer;
    for (i = 0; i<n; i++) {
      people[i].leftx = size[1];
      people[i].rightx = 0;
      people[i].y = size[0] / n;
      people[i].dy = ph;
    }
    function getx(x) {
      return (x-leftx) / (rightx - leftx) * size[0];
    }
    for (i=0; i<m; i++) {
      var lx,rx;
      var channel;
      var s = topics[i].slot;
      channel = slots[s].y;
      lx = getx(topics[i].begin);
      rx = getx(topics[i].end);
      var y,dy;
      var temp  = topics[i].participants;   
      channel += parseInt((temp.length - slots[s].height)/2);
      topics[i].y = channel * channelHeight;
      topics[i].dy = temp.length * channelHeight;    
      topics[i].leftx = lx;
      topics[i].rightx = rx;
      for (j =0; j<temp.length; j++) {
        temp[j].leftx = lx;
        temp[j].rightx = rx;
        temp[j].y = (channel + j +phPad) * channelHeight;
        temp[j].ry = (j +phPad) * channelHeight;
        temp[j].dy = channelHeight * phPer;
      }
    }
  }
  return storyline;
}; 