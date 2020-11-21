const test = require('tape');
const di = require('../../di');
const smtpServerObject = di.get('smtpServer');

test('Calling smtpServer', function (t) {
  t.plan(1);

  let stream = 'Received: by mail-ed1-f73.google.com with SMTP id cy24so19885102edb.12\n' +
    '        for <00DS0000003Eixf@igrik.site>; Tue, 31 Dec 2019 01:32:56 -0800 (PST)\n' +
    'DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed;\n' +
    '        d=google.com; s=20161025;\n' +
    '        h=mime-version:reply-to:sender:auto-submitted:message-id:date:subject\n' +
    '         :from:to;\n' +
    '        bh=goym6w7sDC07jKOsGwuP4k3RrREn0vhu/b6rOv87khM=;\n' +
    '        b=fyXT/Dc04nd+uUzqQClfJ1K3nCjp4iEGcZKsVYwZEqJDf5V0OcTTMP/aRQltruPHCB\n' +
    '         QKHVcwtn3YaYT/iPlaS39Vh0LSsHFVaW5sDB1CazQG8C9cS229f0ACYwJeuPG+lnhOFq\n' +
    '         dA7DhVL6UziRRsnv1JhGhEQm2D4OafIMPHgulPEzTEhsyDvFHYX9aB5GQSruY0LrC/Re\n' +
    '         Xb8kKwMsMgwR64o5cvjw2yG6oA9R5hMkYewFxQZffA22gqVVdcLpmZRGY3CPD6rR7vhD\n' +
    '         CC5kMG7uBoKK+MahrTCOSIDC7gW4B3X5sZ4coYmSiblWc2CAoCXO5AhgizSfktL0T3F7\n' +
    '         W9Kw==\n' +
    'DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed;\n' +
    '        d=avenga-com.20150623.gappssmtp.com; s=20150623;\n' +
    '        h=mime-version:reply-to:sender:auto-submitted:message-id:date:subject\n' +
    '         :from:to;\n' +
    '        bh=goym6w7sDC07jKOsGwuP4k3RrREn0vhu/b6rOv87khM=;\n' +
    '        b=NcPOI2ygM6UJ45BSxG0cZvrD6uWSO01vgZB1XwuXVwe6CYwFmJDNnujW2HHDUzk5bJ\n' +
    '         sij5aKku26vtYeL00Z8QnUVuWTKwUgZaJDLBpAG+hee8gREHuY9OgnERQfFOfbVCEwDd\n' +
    '         IcKRpo8o0faUjpDGEjVLPPHQC0VAv+6DD8HHEf8ZqrUqNLMOL4oZoyOxU8GhM4mlg5bo\n' +
    '         gXyA4y7cjsvDqKOcbXkvui7lurryvw2igr9NKKJBLHCmxxhbWjg3qohh+os4MV95kuun\n' +
    '         qQ1uA/2eItXqSG99t6U4SwSkA+d8mCjyqYtWr0zuXnX0lSftL8j/Gt9chjwBnwqCWUMF\n' +
    '         OW4Q==\n' +
    'X-Google-DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed;\n' +
    '        d=1e100.net; s=20161025;\n' +
    '        h=x-gm-message-state:mime-version:reply-to:sender:auto-submitted\n' +
    '         :message-id:date:subject:from:to;\n' +
    '        bh=goym6w7sDC07jKOsGwuP4k3RrREn0vhu/b6rOv87khM=;\n' +
    '        b=CGlSxzPXpc2XTJUUPhNO4oqavFpSmgEKCdiiUuQh32CGiXrq4T59T4AHZHe8gpbN6/\n' +
    '         VMYJWHpU0AL7bMKla+XtHYGWkJC+4zLJSPxtPyVbPSU+DIecRa1+4nS4hIQe9974ps+L\n' +
    '         SzBunjipkeXJdx1LWTnYcO4clcmleROC5+0ix6wYJpJpspwQRLYhmKeYPj1k87S986dR\n' +
    '         XbWg1YHi5PeZYW3u4QYqZd55YavAItnDJPpruds2HX9Uvpna1XrqBoPxGg8jUVPs2uZx\n' +
    '         37msX6wV5XxDfzCnF4sC/bNQeV/7fJ2yEKQ+MOtU2W9+/rAsXosdXdavafnpKCyO0Y89\n' +
    '         FlQQ==\n' +
    'X-Gm-Message-State: APjAAAXEIa0TZxbSG1tWPRSmNaqr1+zY+mRZ/slr2pmec9DCmrmo7S4Z\n' +
    '\tEanmELh6/QQBCR/gxzCeLGENjz2RF2W5GIiMo+WSYH3pWMpjR1G+cgIH6EwbsWpL7HVJEz4sl5h\n' +
    '\t7k0Z4r3U+r6erAdEnjxwpEeXjiZClRHgMmzi4YbPpTN15yXsCZ4YNdrT8UbFQ3aL0zaYjoBqA8J\n' +
    '\tF7LSe968KAxa6UB0dezk8=\n' +
    'X-Google-Smtp-Source: APXvYqyvWazTvvber43d+rANmYGQbSPQl/OVGCRpIgDkq9dXV7B25thQzNZ89H9LJ5WhWAmniPipwgLdsAw2RPQbW+ah\n' +
    'MIME-Version: 1.0\n' +
    'X-Received: by 2002:a17:906:b841:: with SMTP id ga1mr46543920ejb.184.1577784776240;\n' +
    ' Tue, 31 Dec 2019 01:32:56 -0800 (PST)\n' +
    'Reply-To: ihor.litovka@avenga.com\n' +
    'Sender: Google Calendar <calendar-notification@google.com>\n' +
    'Auto-Submitted: auto-generated\n' +
    'Message-ID: <0000000000001ecfa5059afca5d1@google.com>\n' +
    'Date: Tue, 31 Dec 2019 09:32:56 +0000\n' +
    'Subject: Accepted: summary @ Tue Jan 7, 2020 3:21pm - 3:51pm (EET) (OCEADMIN OCEADMIN)\n' +
    'From: ihor.litovka@avenga.com\n' +
    'To: OCEADMIN OCEADMIN <00d5d000000devvua4@igrik.site>\n' +
    'Content-Type: multipart/mixed; boundary="0000000000001ecf8a059afca5d0"\n' +
    '\n' +
    '--0000000000001ecf8a059afca5d0\n' +
    'Content-Type: multipart/alternative; boundary="0000000000001ecf88059afca5ce"\n' +
    '\n' +
    '--0000000000001ecf88059afca5ce\n' +
    'Content-Type: text/plain; charset="UTF-8"; format=flowed; delsp=yes\n' +
    'Content-Transfer-Encoding: base64\n' +
    '\n' +
    'aWhvci5saXRvdmthQGF2ZW5nYS5jb20gaGFzIGFjY2VwdGVkIHRoaXMgaW52aXRhdGlvbi4NCg0K\n' +
    'VGl0bGU6IHN1bW1hcnkNCldoZW46IFR1ZSBKYW4gNywgMjAyMCAzOjIxcG0g4oCTIDM6NTFwbSBF\n' +
    'YXN0ZXJuIEV1cm9wZWFuIFRpbWUgLSBLaWV2DQpXaGVyZTogc29tZSBsb2NhdGlvbg0KQ2FsZW5k\n' +
    'YXI6IE9DRUFETUlOIE9DRUFETUlODQpXaG86DQogICAgICogT0NFQURNSU4gT0NFQURNSU4gLSBv\n' +
    'cmdhbml6ZXINCiAgICAgKiBpaG9yLmxpdG92a2FAYXZlbmdhLmNvbSAtIGNyZWF0b3INCiAgICAg\n' +
    'KiBBdHRlbmRlZSAyDQoNCg0KSW52aXRhdGlvbiBmcm9tIEdvb2dsZSBDYWxlbmRhcjogaHR0cHM6\n' +
    'Ly93d3cuZ29vZ2xlLmNvbS9jYWxlbmRhci8NCg0KWW91IGFyZSByZWNlaXZpbmcgdGhpcyBjb3Vy\n' +
    'dGVzeSBlbWFpbCBhdCB0aGUgYWNjb3VudCAgDQowMGQ1ZDAwMDAwMGRldnZ1YTRAaWdyaWsuc2l0\n' +
    'ZSBiZWNhdXNlIHlvdSBhcmUgYW4gYXR0ZW5kZWUgb2YgdGhpcyBldmVudC4NCg0KVG8gc3RvcCBy\n' +
    'ZWNlaXZpbmcgZnV0dXJlIHVwZGF0ZXMgZm9yIHRoaXMgZXZlbnQsIGRlY2xpbmUgdGhpcyBldmVu\n' +
    'dC4gIA0KQWx0ZXJuYXRpdmVseSB5b3UgY2FuIHNpZ24gdXAgZm9yIGEgR29vZ2xlIGFjY291bnQg\n' +
    'YXQgIA0KaHR0cHM6Ly93d3cuZ29vZ2xlLmNvbS9jYWxlbmRhci8gYW5kIGNvbnRyb2wgeW91ciBu\n' +
    'b3RpZmljYXRpb24gc2V0dGluZ3MgZm9yICANCnlvdXIgZW50aXJlIGNhbGVuZGFyLg0KDQpGb3J3\n' +
    'YXJkaW5nIHRoaXMgaW52aXRhdGlvbiBjb3VsZCBhbGxvdyBhbnkgcmVjaXBpZW50IHRvIHNlbmQg\n' +
    'YSByZXNwb25zZSB0byAgDQp0aGUgb3JnYW5pemVyIGFuZCBiZSBhZGRlZCB0byB0aGUgZ3Vlc3Qg\n' +
    'bGlzdCwgb3IgaW52aXRlIG90aGVycyByZWdhcmRsZXNzICANCm9mIHRoZWlyIG93biBpbnZpdGF0\n' +
    'aW9uIHN0YXR1cywgb3IgdG8gbW9kaWZ5IHlvdXIgUlNWUC4gTGVhcm4gbW9yZSBhdCAgDQpodHRw\n' +
    'czovL3N1cHBvcnQuZ29vZ2xlLmNvbS9jYWxlbmRhci9hbnN3ZXIvMzcxMzUjZm9yd2FyZGluZw0K\n' +
    '--0000000000001ecf88059afca5ce\n' +
    'Content-Type: text/html; charset="UTF-8"\n' +
    'Content-Transfer-Encoding: quoted-printable\n' +
    '\n' +
    '<span itemscope itemtype=3D"http://schema.org/InformAction"><span style=3D"=\n' +
    'display:none" itemprop=3D"about" itemscope itemtype=3D"http://schema.org/Pe=\n' +
    'rson"><meta itemprop=3D"description" content=3D"ihor.litovka@avenga.com acc=\n' +
    'epted"/></span><span itemprop=3D"object" itemscope itemtype=3D"http://schem=\n' +
    'a.org/Event"><div style=3D""><table cellspacing=3D"0" cellpadding=3D"8" bor=\n' +
    'der=3D"0" summary=3D"" style=3D"width:100%;font-family:Arial,Sans-serif;bor=\n' +
    'der:1px Solid #ccc;border-width:1px 2px 2px 1px;background-color:#fff;"><tr=\n' +
    '><td><div style=3D"padding:6px 0;margin:0 0 4px 0;font-family:Arial,Sans-se=\n' +
    'rif;font-size:13px;line-height:1.4;border:1px Solid #ccc;background:#ffc;co=\n' +
    'lor:#222"><strong><span itemprop=3D"attendee" itemscope itemtype=3D"http://=\n' +
    'schema.org/Person"><span itemprop=3D"name" class=3D"notranslate">ihor.litov=\n' +
    'ka@avenga.com</span><meta itemprop=3D"email" content=3D"ihor.litovka@avenga=\n' +
    '.com"/></span> has accepted this invitation.</strong></div><div style=3D"pa=\n' +
    'dding:2px"><span itemprop=3D"publisher" itemscope itemtype=3D"http://schema=\n' +
    '.org/Organization"><meta itemprop=3D"name" content=3D"Google Calendar"/></s=\n' +
    'pan><meta itemprop=3D"eventId/googleCalendar" content=3D"_e5rmasjkf4t6uor5b=\n' +
    'tfmarb1d5m78sj1dppm2orkd5nmsnqvccmk8c1g60o30c1g5ko30c1g5ko30c1g5ko30c1g5ko3=\n' +
    '0c1g60o30c1g60o32"/><h3 style=3D"padding:0 0 6px 0;margin:0;font-family:Ari=\n' +
    'al,Sans-serif;font-size:16px;font-weight:bold;color:#222"><span itemprop=3D=\n' +
    '"name">summary</span></h3><table style=3D"display:inline-table" cellpadding=\n' +
    '=3D"0" cellspacing=3D"0" border=3D"0" summary=3D"Event details"><tr><td sty=\n' +
    'le=3D"padding:0 1em 10px 0;font-family:Arial,Sans-serif;font-size:13px;colo=\n' +
    'r:#888;white-space:nowrap;width:90px" valign=3D"top"><div><i style=3D"font-=\n' +
    'style:normal">When</i></div></td><td style=3D"padding-bottom:10px;font-fami=\n' +
    'ly:Arial,Sans-serif;font-size:13px;color:#222" valign=3D"top"><div style=3D=\n' +
    '"text-indent:-1px"><time itemprop=3D"startDate" datetime=3D"20200107T132147=\n' +
    'Z"></time><time itemprop=3D"endDate" datetime=3D"20200107T135147Z"></time>T=\n' +
    'ue Jan 7, 2020 3:21pm =E2=80=93 3:51pm <span style=3D"color:#888">Eastern E=\n' +
    'uropean Time - Kiev</span></div></td></tr><tr><td style=3D"padding:0 1em 10=\n' +
    'px 0;font-family:Arial,Sans-serif;font-size:13px;color:#888;white-space:now=\n' +
    'rap;width:90px" valign=3D"top"><div><i style=3D"font-style:normal">Where</i=\n' +
    '></div></td><td style=3D"padding-bottom:10px;font-family:Arial,Sans-serif;f=\n' +
    'ont-size:13px;color:#222" valign=3D"top"><div style=3D"text-indent:-1px"><s=\n' +
    'pan itemprop=3D"location" itemscope itemtype=3D"http://schema.org/Place"><s=\n' +
    'pan itemprop=3D"name" class=3D"notranslate">some location</span><span dir=\n' +
    '=3D"ltr"> (<a href=3D"https://www.google.com/maps/search/some+location?hl=\n' +
    '=3Den" style=3D"color:#20c;white-space:nowrap" target=3D"_blank" itemprop=\n' +
    '=3D"map">map</a>)</span></span></div></td></tr><tr><td style=3D"padding:0 1=\n' +
    'em 10px 0;font-family:Arial,Sans-serif;font-size:13px;color:#888;white-spac=\n' +
    'e:nowrap;width:90px" valign=3D"top"><div><i style=3D"font-style:normal">Cal=\n' +
    'endar</i></div></td><td style=3D"padding-bottom:10px;font-family:Arial,Sans=\n' +
    '-serif;font-size:13px;color:#222" valign=3D"top"><div style=3D"text-indent:=\n' +
    '-1px">OCEADMIN OCEADMIN</div></td></tr><tr><td style=3D"padding:0 1em 10px =\n' +
    '0;font-family:Arial,Sans-serif;font-size:13px;color:#888;white-space:nowrap=\n' +
    ';width:90px" valign=3D"top"><div><i style=3D"font-style:normal">Who</i></di=\n' +
    'v></td><td style=3D"padding-bottom:10px;font-family:Arial,Sans-serif;font-s=\n' +
    'ize:13px;color:#222" valign=3D"top"><table cellspacing=3D"0" cellpadding=3D=\n' +
    '"0"><tr><td style=3D"padding-right:10px;font-family:Arial,Sans-serif;font-s=\n' +
    'ize:13px;color:#222;width:10px"><div style=3D"text-indent:-1px"><span style=\n' +
    '=3D"font-family:Courier New,monospace">&#x2022;</span></div></td><td style=\n' +
    '=3D"padding-right:10px;font-family:Arial,Sans-serif;font-size:13px;color:#2=\n' +
    '22"><div style=3D"text-indent:-1px"><div><div style=3D"margin:0 0 0.3em 0">=\n' +
    '<span class=3D"notranslate">OCEADMIN OCEADMIN</span><span itemprop=3D"organ=\n' +
    'izer" itemscope itemtype=3D"http://schema.org/Person"><meta itemprop=3D"nam=\n' +
    'e" content=3D"OCEADMIN OCEADMIN"/><meta itemprop=3D"email" content=3D"00d5d=\n' +
    '000000devvua4@igrik.site"/></span><span style=3D"font-size:11px;color:#888"=\n' +
    '> - organizer</span></div></div></div></td></tr><tr><td style=3D"padding-ri=\n' +
    'ght:10px;font-family:Arial,Sans-serif;font-size:13px;color:#222;width:10px"=\n' +
    '><div style=3D"text-indent:-1px"><span style=3D"font-family:Courier New,mon=\n' +
    'ospace">&#x2022;</span></div></td><td style=3D"padding-right:10px;font-fami=\n' +
    'ly:Arial,Sans-serif;font-size:13px;color:#222"><div style=3D"text-indent:-1=\n' +
    'px"><div><div style=3D"margin:0 0 0.3em 0"><span itemprop=3D"attendee" item=\n' +
    'scope itemtype=3D"http://schema.org/Person"><span itemprop=3D"name" class=\n' +
    '=3D"notranslate">ihor.litovka@avenga.com</span><meta itemprop=3D"email" con=\n' +
    'tent=3D"ihor.litovka@avenga.com"/></span><span style=3D"font-size:11px;colo=\n' +
    'r:#888"> - creator</span></div></div></div></td></tr><tr><td style=3D"paddi=\n' +
    'ng-right:10px;font-family:Arial,Sans-serif;font-size:13px;color:#222;width:=\n' +
    '10px"><div style=3D"text-indent:-1px"><span style=3D"font-family:Courier Ne=\n' +
    'w,monospace">&#x2022;</span></div></td><td style=3D"padding-right:10px;font=\n' +
    '-family:Arial,Sans-serif;font-size:13px;color:#222"><div style=3D"text-inde=\n' +
    'nt:-1px"><div><div style=3D"margin:0 0 0.3em 0"><span itemprop=3D"attendee"=\n' +
    ' itemscope itemtype=3D"http://schema.org/Person"><span itemprop=3D"name" cl=\n' +
    'ass=3D"notranslate">Attendee 2</span><meta itemprop=3D"email" content=3D"li=\n' +
    'tovkaigor@outlook.com"/></span></div></div></div></td></tr></table></td></t=\n' +
    'r></table></div></td></tr><tr><td style=3D"background-color:#f6f6f6;color:#=\n' +
    '888;border-top:1px Solid #ccc;font-family:Arial,Sans-serif;font-size:11px">=\n' +
    '<p>Invitation from <a href=3D"https://www.google.com/calendar/" target=3D"_=\n' +
    'blank" style=3D"">Google Calendar</a></p><p>You are receiving this courtesy=\n' +
    ' email at the account 00d5d000000devvua4@igrik.site because you are an atte=\n' +
    'ndee of this event.</p><p>To stop receiving future updates for this event, =\n' +
    'decline this event. Alternatively you can sign up for a Google account at h=\n' +
    'ttps://www.google.com/calendar/ and control your notification settings for =\n' +
    'your entire calendar.</p><p>Forwarding this invitation could allow any reci=\n' +
    'pient to send a response to the organizer and be added to the guest list, o=\n' +
    'r invite others regardless of their own invitation status, or to modify you=\n' +
    'r RSVP. <a href=3D"https://support.google.com/calendar/answer/37135#forward=\n' +
    'ing">Learn More</a>.</p></td></tr></table></div></span></span>\n' +
    '--0000000000001ecf88059afca5ce\n' +
    'Content-Type: text/calendar; charset="UTF-8"; method=REPLY\n' +
    'Content-Transfer-Encoding: 7bit\n' +
    '\n' +
    'BEGIN:VCALENDAR\n' +
    'PRODID:-//Google Inc//Google Calendar 70.9054//EN\n' +
    'VERSION:2.0\n' +
    'CALSCALE:GREGORIAN\n' +
    'METHOD:REPLY\n' +
    'BEGIN:VEVENT\n' +
    'DTSTART:20200107T132147Z\n' +
    'DTEND:20200107T135147Z\n' +
    'DTSTAMP:20191231T093256Z\n' +
    'ORGANIZER;CN=OCEADMIN OCEADMIN:mailto:00DS0000003Eixf@test.com\n' +
    'UID:qwerty:oce__emailtransaction__c-D0000000-0000-0000-0000-000000000001\n' +
    'ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=ihor.l\n' +
    ' itovka@avenga.com;X-NUM-GUESTS=0:mailto:ihor.litovka@avenga.com\n' +
    'CREATED:20191219T142147Z\n' +
    'DESCRIPTION:\n' +
    'LAST-MODIFIED:20191231T093255Z\n' +
    'LOCATION:some location\n' +
    'SEQUENCE:0\n' +
    'STATUS:CONFIRMED\n' +
    'SUMMARY:summary\n' +
    'TRANSP:OPAQUE\n' +
    'X-ORGID:00D5D000000DEVVUA4\n' +
    'END:VEVENT\n' +
    'END:VCALENDAR\n' +
    '\n' +
    '--0000000000001ecf88059afca5ce--\n' +
    '--0000000000001ecf8a059afca5d0\n' +
    'Content-Type: application/ics; name="invite.ics"\n' +
    'Content-Disposition: attachment; filename="invite.ics"\n' +
    'Content-Transfer-Encoding: base64\n' +
    '\n' +
    'QkVHSU46VkNBTEVOREFSDQpQUk9ESUQ6LS8vR29vZ2xlIEluYy8vR29vZ2xlIENhbGVuZGFyIDcw\n' +
    'LjkwNTQvL0VODQpWRVJTSU9OOjIuMA0KQ0FMU0NBTEU6R1JFR09SSUFODQpNRVRIT0Q6UkVQTFkN\n' +
    'CkJFR0lOOlZFVkVOVA0KRFRTVEFSVDoyMDIwMDEwN1QxMzIxNDdaDQpEVEVORDoyMDIwMDEwN1Qx\n' +
    'MzUxNDdaDQpEVFNUQU1QOjIwMTkxMjMxVDA5MzI1NloNCk9SR0FOSVpFUjtDTj1PQ0VBRE1JTiBP\n' +
    'Q0VBRE1JTjptYWlsdG86MDBkNWQwMDAwMDBkZXZ2dWE0QGlncmlrLnNpdGUNClVJRDpxd2VydHk6\n' +
    'b2NlX19lbWFpbHRyYW5zYWN0aW9uX19jLUQwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAw\n' +
    'MDAwMQ0KQVRURU5ERUU7Q1VUWVBFPUlORElWSURVQUw7Uk9MRT1SRVEtUEFSVElDSVBBTlQ7UEFS\n' +
    'VFNUQVQ9QUNDRVBURUQ7Q049aWhvci5sDQogaXRvdmthQGF2ZW5nYS5jb207WC1OVU0tR1VFU1RT\n' +
    'PTA6bWFpbHRvOmlob3IubGl0b3ZrYUBhdmVuZ2EuY29tDQpDUkVBVEVEOjIwMTkxMjE5VDE0MjE0\n' +
    'N1oNCkRFU0NSSVBUSU9OOg0KTEFTVC1NT0RJRklFRDoyMDE5MTIzMVQwOTMyNTVaDQpMT0NBVElP\n' +
    'Tjpzb21lIGxvY2F0aW9uDQpTRVFVRU5DRTowDQpTVEFUVVM6Q09ORklSTUVEDQpTVU1NQVJZOnN1\n' +
    'bW1hcnkNClRSQU5TUDpPUEFRVUUNClgtT1JHSUQ6MDBENUQwMDAwMDBERVZWVUE0DQpFTkQ6VkVW\n' +
    'RU5UDQpFTkQ6VkNBTEVOREFSDQo=\n' +
    '--0000000000001ecf8a059afca5d0--\n';

  di.get('request').setCallback((params, callback) => {
    callback(undefined, { statusCode: 200 }, JSON.stringify({
      access_token: "access_token",
      instance_url: "instance_url",
      access_token_expiration: Date.now() + 3600,
      namespace_prefix: ""
    }));
  });

  smtpServerObject.process(stream).then(() => {
    t.pass("Mail parsed successfully");
  }).catch((err) => {
    t.fail(err.message);
  });
});
