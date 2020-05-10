(() => { //即時関数
  'use strict';

    const firebaseConfig = {
      apiKey: "AIzaSyC2Xi9q3SaFz9QM8P9jtj9ac03N9PPoz3I",
      authDomain: "myfirebasechatapp-4c67c.firebaseapp.com",
      databaseURL: "https://myfirebasechatapp-4c67c.firebaseio.com",
      projectId: "myfirebasechatapp-4c67c",
      storageBucket: "myfirebasechatapp-4c67c.appspot.com",
      messagingSenderId: "598411146383",
      appId: "1:598411146383:web:f11bda211243dd6753ecfa",
      measurementId: "G-N5M2Q42HKR"
    };
    firebase.initializeApp(firebaseConfig);
    firebase.analytics();

    const db = firebase.firestore(); //firebaseを使えるようにする
    const collection = db.collection('messages'); //messagesという名前のcollection作成

    const auth = firebase.auth(); //authのインスタンス作成(匿名ログイン)
    let me = null; //ユーザー情報の保持 null→初期化

    const message = document.getElementById('message'); //message要素を取得
    const form = document.querySelector('form'); //form要素を取得
    const messages = document.getElementById('messages'); //messages要素を取得
    const login = document.getElementById('login'); //login要素を取得
    const logout = document.getElementById('logout'); //logout要素を取得

    // クリックイベント設定
    login.addEventListener('click', () =>{ //loginクリックで以下の処理
      auth.signInAnonymously(); //匿名ログイン
    });
    logout.addEventListener('click', () =>{ //logoutクリックで以下の処理
      auth.signOut(); //ログアウトする
    });

    //ログイン状態の監視
    auth.onAuthStateChanged(user => { //userを受け取り
      //userがtrueだったらログインしていることになる（userになんらかの値が設定されているので）
      if (user) {
        me = user; //ログインした時にuserをセット
        //ログインした時に以前のメッセージを再び（２回）読み込まないようにする
        while (messages.firstChild) {
          messages.removeChild(messages.firstChild);
        }
        //格納したデータを表示する collectionの監視
        collection.orderBy('created').onSnapshot(snapshot => { //'created'のフォールドでソートする 処理が   成功したらsnapshotが返る onSnapshotで変更の監視
          snapshot.docChanges().forEach(change => { //変更はdocChanges()に入る 受け取る内容はchangeとする
            if (change.type === 'added') { //データが追加された時以下の処理をする
            const li = document.createElement('li'); //そのデータでli要素を作る
            const d = change.doc.data();
            li.textContent = d.uid.substr(0, 8) + ': ' + d.message; //データが設定 ユーザーID最初の8桁
            messages.appendChild(li); //messagesに対して子要素としてliを追加
            }
          });
        }, error => {}); //エラー処理 指定なし
        console.log(`Logged in as: ${user.uid}`); //ユーザーID表示
        login.classList.add('hidden'); //ログイン成功したのでLoginボタンを消す
        [logout, form, messages].forEach(el => { //elで受け取りつつ
          el.classList.remove('hidden');//配列の要素を表示する
        });
        message.focus(); //ページが読み込まれた時、フォーカスを当てる
        return;
      }
      me = null; //ユーザー情報初期化
      console.log('Nobody is logged in'); //「誰もログインしていない」と表示
      login.classList.remove('hidden'); //ログアウトしたのでLoginボタンを表示
      [logout, form, messages].forEach(el => { //elで受け取りつつ
        el.classList.add('hidden');//配列の要素を消す
      });
    });
    //イベントの設定
    form.addEventListener('submit', e => { //'submit'とイベントオブジェクトを引数に取る
      e.preventDefault(); //ページ推移しないようにする

        const val = message.value.trim(); //入力された値を変数で受け取る trim()で前後の空白を取る
        if (val === "") { //もしvalが空文字だったら
          return; //処理を止める
        }

        message.value = ''; //messageを空にする
        message.focus(); //フォーカスを当てる（連続で入力しやすくするため）

      //保存の処理
      collection.add({ //データを保存してDocumentにユニークIDを付ける
        //フィールド
        message: val,
        created: firebase.firestore.FieldValue.serverTimestamp(), //createdキーでサーバー側のタイムスタンプを取得
        uid: me ? me.uid : 'nobody'
      })
      //then()で処理に成功した時の処理を書くことができる
      .then(doc => {
        console.log(`${doc.id} added!`) //docを引数に持ちつつIDを表示
      })
      //catch()でエラーが起きた時の処理を書くことができる
      .catch(error => {
        console.log('document add errar!'); //書き込みエラーメッセージ
        console.log(error);
      });
    });
})();