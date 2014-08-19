"use strict"

//_rhaboo_trace = function(s) { console.log(s); }

Rhaboo.onBusiness(function (busy) {
  document.getElementById("business").innerHTML = busy?"Busy":"Idle";
});


if (page === 0) {
  for (var k in localStorage)
    if (localStorage.hasOwnProperty(k))
      localStorage.removeItem(k);
  localStorage.setItem("nextPhase", 2);
}


function same_ (p,e) {
  if (typeof p !== 'object' || typeof e !== 'object')
    return (p === e);
  if (typeof 0 === 'object')
    if (p.length !== e.length)
      return false;

  var en = 0, pn = 0;
  for (var ec in e) if (e.hasOwnProperty(ec)) en++;
  for (var pc in p) if ((pc !== '_rhaboo') && p.hasOwnProperty(pc)) {
    //console.log("MYSTERY:"+pc+":"+p[pc]);
    pn++;
    if (!same_(p[pc], e[pc]))
      return false;
  }
  //console.log("PN:"+pn+",EN:"+en);
  return (pn === en);
}

function same(p,e) {
  var ret = same_(p,e);
  if (!ret) {
    console.log("FAILED");
    console.log("P("+p.length+") : " + ajon.stringify(p, ['_rhaboo']));
    console.log("E("+p.length+") : " + ajon.stringify(e));
  }
  return ret;
}

var tests = {};

var bored=10;

for (var pe in persistents) if (persistents.hasOwnProperty(pe)) {
//  bored = bored - 1;
  if (bored<=0)
    break;
  //console.log("A");
  tests[pe] = function (pe) { return function (assert) {
    var store = new Rhaboo.Persistent(pe);
    var steps = persistents[pe];
  //  console.log("C : "+ JSON.stringify(persistents));
  //  console.log("D : "+ pe);
    for (var st in steps) if (steps.hasOwnProperty(st)) { 
   //   console.log("B");
      var step = steps[st];
      if (step.action=="write" || step.action=="array") {
        var path = step.path.slice();
        var target = store;
        var where;
        if (step.action==="write") 
          where = path.pop();
        var x;
        for (x = path.shift(); x; x=path.shift()) {
          target = target[x];
        }
        var vehicle = ajon.parse(step.vehicle);
        if (step.action==="write") {
          target.write(where, vehicle.val);
        } else if (step.action=="array") {
          Array.prototype[vehicle[0]].apply(target, vehicle[1])
        }
      }

      var expect = ajon.parse(step.expect);
      if (expect===undefined)
        console.log("No expectation: "+step.expect);
      assert.ok(same(store, expect));
    }   }};
}

for (var p in tests) if (tests.hasOwnProperty(p)) {
  QUnit.test(p+ " test", tests[p](p));
}

// {\"P1000031\":{\"c\":[{\"x\":2,\"y\":true}],\"b\":[]},\"P1000032\":null}