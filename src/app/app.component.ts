import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent implements OnInit,OnDestroy  {
  name = 'Serial Port ';
  port: any;
  signal:any;
  strMessage: string = "";
  readData = true;
  reader;  
  strResult = "";
  
  async ngOnInit() { }

  async onPortOpen()
  {
    if ("serial" in navigator) {
      await (navigator as any).serial.requestPort().then(async (port) => {
        this.port = port;
        await this.port.open({ baudRate: 9600 });
        this.readData = true;
        this.strMessage = "Opened";
        this.strResult = "";
        // await port.setSignals({ break: false });
        // await port.setSignals({ dataSetReady: true });

        this.signal = await this.port.getSignals();
        this.strMessage = JSON.stringify(this.signal);
        await this.readUntilClosed();
      }).catch((e) => {
        this.strMessage = e;
      });
    }
  } 

  async readUntilClosed() {
    while (this.port.readable && this.readData) {
      this.reader = this.port.readable.getReader();
      try {
        while (true) {
          const { value, done } = await this.reader.read();
          if (done) {
            break;
          }
          this.strResult += value + " ";
          console.log(value);
        }
      } catch (e) {
        this.strMessage = e;
      } finally {          
        this.reader.releaseLock();
      }
    }
    await this.port.close();
    await this.port.forget();
    this.strMessage = "Closed";
  }
  
  async onPortClose()
  {
    this.readData = false;    
    try{
      //await this.port.forget();
      this.reader.cancel();
      await this.readUntilClosed();
    }
    catch (e){
      this.strMessage = e;
    }
  }

  ngOnDestroy() { 
    //ss
  }
}
