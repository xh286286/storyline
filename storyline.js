d3.storyline = function() {
  var storyline = {},
      personHeight = 24,
      personPadding = 4,
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

  storyline.links = function() {
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
      var x0 = d.source.x + d.source.dx,
          x1 = d.target.x,
          xi = d3.interpolateNumber(x0, x1),
          x2 = xi(curvature),
          x3 = xi(1 - curvature),
          y0 = d.source.y + d.sy + d.dy / 2,
          y1 = d.target.y + d.ty + d.dy / 2;
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
    int totslots = 0;
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
        if (temp.length > slots[s].length) slots[s].length = temp.length;
      }
  	}
    var acc = 0;
    for (i=0; i<totslots; i++) {
      if (slots[i] === undefined) slots[i] = {"length":0};
      slots[i].dy = acc;
      acc += slots[i].length;
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
        links.push(newlink);
        lastEnd[p] = temp[j];
      }
    }
    for ( i =0; i<n; i++) {
      var newlink = {};
      newlink.left = lastEnd[p];
      lastEnd.right = newlink;
      people[i].left= newlink;
      newlink.right = people[i];
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
    leftx = vSize[0];
    rightx = vSize[1];
    leftx -= (vSize[1] - vSize[0]) * 0.1;
    rightx += (vSize[1] - vSize[0]) * 0.1;

  }
}; 